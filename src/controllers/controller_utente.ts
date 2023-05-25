import { Request,Response,NextFunction } from 'express'
import {Cliente, ICliente} from '../schemas/cliente_schema'
import {Utente,IUtente} from '../schemas/utente_schema'
import mongoose from 'mongoose'

import dotenv from 'dotenv'
import { Terapeuta, ITerapeuta } from '../schemas/terapeuta_schema'
import jwt from 'jsonwebtoken'
import { remove_prenotazioni_if_disassociato } from './controller_sedute'
import { check_and_hash } from './password_hasher'
import { send_mail } from './gmail_connector'

export async function registrazione(req:Request,res:Response,next:NextFunction) {
    /* STRUTTURA RICHIESTA: utente base
    *  username: string
    *  password :string
    *  ruolo: num
    *  nome: string
    *  cognome: string
    *  email: string
    *  codice_fiscale: string
    *  foto_profilo: Image
    *  data_nascita: Date
    *               SOLO PER IL TERAPEUTA
    *  documenti: string[]
    *  limite_clienti: num
    *  indirizzo:string
    */
   //const {username,password, ruolo,nome,cognome,email,cf,fp,dn,doc,lim,ind}=req.body
   const username=req.body.username
   const password=req.body.password
   const ruolo = req.body.ruolo
   const nome=req.body.nome
   const cognome=req.body.cognome
   const email=req.body.email
   const cf=req.body.codice_fiscale
   const fp=req.body.foto_profilo
   const dn=req.body.data_nascita
   const doc=req.body.documenti
   const lim=req.body.limite_clienti
   const ind=req.body.indirizzo
   
   //console.log([username,password, ruolo,nome,cognome,email,cf,fp,dn,doc,lim,ind])
   
   if(!username||!password||!ruolo||!nome||!cognome||!email||!cf||fp||!dn) {       //si potrebbe far fare al catch usando i campi required 
    res.status(400)
    req.body = {
        successful:false,
        message:"Not enough arguments!"
    }
    next()
    return
   }
   else if (ruolo<1||ruolo>2) {
    res.status(403)
    req.body = {
        successful:false,
        message:"Invalid role!"
    }
    next()
    return
   }
   

   try{
    await mongoose.connect(process.env.DB_CONNECTION_STRING)
    let utente_presente = await Utente.findOne({username:username}).exec()    //check nel db
    if(!utente_presente){
        let utente_schema
        if(ruolo==1){
            utente_schema= new Cliente<ICliente>({
                username:username,
                password:password,
                ruolo:ruolo,
                nome:nome,
                cognome:cognome,
                email:email,
                cf:cf,
                foto_profilo:fp,
                data_nascita:dn
            })
        }
        else if (ruolo==2){
            if(!doc||!lim){
                res.status(400)
                req.body={
                    successful:false,
                    message:"Not enough arguments!"
                }
            }
            utente_schema= new Terapeuta({
                username:username,
                password:password,
                ruolo:ruolo,
                nome:nome,
                cognome:cognome,
                email:email,
                cf:cf,
                foto_profilo:fp,
                data_nascita:dn,
                documenti:doc,
                limite_clienti: lim,
                indirizzo:ind
            })
        }
        await utente_schema.save();
        // console.log("utente salvato")
        // console.log(utente_schema)

        const token = createToken(utente_schema._id.toString(),utente_schema.username.toString(),utente_schema.ruolo) 

        //in alernativa usare res.redirect(/login) e sfruttare il login handler
        res.status(200)
        req.body={
            successful:true,
            message:"User registered correctly!",
            token : token
        }
        next()
        return
    }else {
        res.status(409)
        req.body={
            successful:false,
            message:"User already exists!"
        }
        next()
        return
    }
   }catch(err){
        res.status(500)
        req.body={
            successful: false,
            message:"Server error in registration - failed!"
        }
        next()
   }
}   


export async function login(req:Request,res:Response,next:NextFunction) {
    const username=req.body.username
    const password=req.body.password


    // controllo su campi mancanti
    if (!username || !password){
        res.status(400)
        req.body={
            successful: false,
            message: "Not enough arguments!"
        }
        next()
        return
    } 

    try {
        // recupero utente dal database
        await mongoose.connect(process.env.DB_CONNECTION_STRING)
        const utente_trovato = await Utente.findOne({username: username}).exec()

        // se non esiste, ritorno un errore
        if (!utente_trovato){
            res.status(404)
            req.body={
                successful: false,
                message: "User not found!"
            }
        };

        // controllo la password
        const modello_utente = new Utente<IUtente>(utente_trovato)
        const passwordCorretta= await modello_utente.checkPassword(password)

        if (!passwordCorretta){
                res.status(401)
                req.body={
                    successful:false,
                    message:"Incorrect password!"
                }
            next()
            return
        };
    
        //creo il token aggiungendo i vari campi utili
        
        const token = createToken(utente_trovato._id.toString(),utente_trovato.username.toString(),utente_trovato.ruolo)
    
        // res.status(200).json({ success: true, token: token })
        res.status(200)
        req.body={
            successful:true,
            message:"User authenticated!",
            token: token 
        }
        next()
        return
    
    } catch (err) {
        res.status(500)
        req.body={
            successful:false,
            message:"Server error in login - failed!"
        }
        next()
        return
    }
}

function createToken(_id:string, username:string, ruolo:Number):string{
    return jwt.sign({
        _id:_id,
        username:username,
        ruolo:ruolo
    },process.env.TOKEN_SECRET,{expiresIn:"2 days"})
}

export async function get_all_terapeuti(req:Request,res:Response,next:NextFunction) {
    try {
        await mongoose.connect(process.env.DB_CONNECTION_STRING)
        // console.log("dbconnesso")
        const catalogo_terapeuti=await Terapeuta.find({ruolo:2}, 'nome cognome foto_profilo')
        // console.log(catalogo_terapeuti)
        res.status(200)
        req.body={
            successful:true,
            message:"Therapist catalog retrieved successfully!",
            catalogo: catalogo_terapeuti
        }
    } catch (err) {
        res.status(500)
        req.body={
            successful:false,
            message:"Server error in therapist catalog - failed!"
        }
    }
    next()
}

export async function get_my_profilo(req:Request,res:Response,next:NextFunction){
    /**
     * 
     * Questa funzione è dedita al recupero del proprio profilo per la visualizzazione delle informazioni personali
     * La richiesta contiene il token decodificato-> _id,username,ruolo. 
     * La verifica dell'esistenza dell'utente è già stata eseguita
     */

    try {
        await mongoose.connect(process.env.DB_CONNECTION_STRING)
        let utente: IUtente|ITerapeuta
        if(req.body.loggedUser.ruolo==1)
            utente = await Cliente.findById(req.body.loggedUser._id,'username ruolo nome cognome email email_confermata cf foto_profilo data_nascita n_gettoni associato').exec()
        else if (req.body.loggedUser.ruolo==2)
            utente = await Terapeuta.findById(req.body.loggedUser._id,'username ruolo nome cognome email email_confermata cf foto_profilo data_nascita associati abilitato limite_clienti indirizzo').exec()
        else{
            res.status(403)
            req.body={
                successful:false,
                message:"Invalid role!"
            }
            next()
            return
        }
        res.status(200)
        req.body={
            successful:true,
            message:"My_profile obtained successfully!",
            profile:utente
        }
        next()    
    } catch (error) {
        res.status(500)
        req.body={
            successful:false,
            message:"Server error in retrieving my_profile - failed!"
        }
    }
}

export async function modify_profilo(req:Request,res:Response,next:NextFunction) {
    /**
     * CAMPI MODIFICABILI:
     * nome
     * cognome
     * email -->non più verificata
     * cf
     * foto_profilo
     * data_nascita
     * 
     * PER IL TERAPEUTA
     * limite_clienti
     * indirizzo
     * documenti
     */

    try {
        await mongoose.connect(process.env.DB_CONNECTION_STRING)
        if(req.body.loggedUser.ruolo==1){
            const cliente = await Cliente.findById(req.body.loggedUser._id).exec()
            let updated_data ={
                nome: req.body.nome?req.body.nome : cliente.nome,
                cognome: req.body.cognome?req.body.cognome : cliente.nome,
                email:req.body.email?req.body.email : cliente.email,
                email_confermata:req.body.email?false:true,
                cf:req.body.cf?req.body.cf : cliente.cf,
                foto_profilo:req.body.foto_profilo?req.body.foto_profilo : cliente.foto_profilo,
                data_nascita: req.body.data_nascita?req.body.data_nascita : cliente.data_nascita
            }
    
            const updated_cliente = await Cliente.findByIdAndUpdate(cliente._id,{
                nome:updated_data.nome,
                cognome:updated_data.cognome,
                email:updated_data.email,
                email_confermata:updated_data.email_confermata,
                cf:updated_data.cf,
                foto_profilo:updated_data.foto_profilo,
                data_nascita:updated_data.data_nascita,
            },{new:true}).exec()
        }else if(req.body.loggedUser.ruolo==2){

            const terapeuta = await Terapeuta.findById(req.body.loggedUser._id).exec()
    
            let updated_data ={
                nome: req.body.nome?req.body.nome : terapeuta.nome,
                cognome: req.body.cognome?req.body.cognome : terapeuta.nome,
                email:req.body.email?req.body.email : terapeuta.email,
                email_confermata:req.body.email?false:true,
                cf:req.body.cf?req.body.cf : terapeuta.cf,
                foto_profilo:req.body.foto_profilo?req.body.foto_profilo : terapeuta.foto_profilo,
                data_nascita: req.body.data_nascita?req.body.data_nascita : terapeuta.data_nascita,
                limite_clienti: req.body.limite_clienti?req.body.limite_clienti : terapeuta.limite_clienti,
                indirizzo:req.body.data_nascita?req.body.indirizzo : terapeuta.indirizzo,
                documenti: req.body.documenti? req.body.documenti : terapeuta.documenti
            }
    
            const updated_cliente = await Terapeuta.findByIdAndUpdate(terapeuta._id,{
                nome:updated_data.nome,
                cognome:updated_data.cognome,
                email:updated_data.email,
                email_confermata:updated_data.email_confermata,
                cf:updated_data.cf,
                foto_profilo:updated_data.foto_profilo,
                data_nascita:updated_data.data_nascita,
                limite_clienti: updated_data.limite_clienti,
                indirizzo:updated_data.indirizzo,
                documenti: updated_data.documenti
            },{new:true}).exec()
        }
        res.status(200)
        req.body={
            successful:true,
            message:"My_profile updated successfully!"
        }
        next()
        return
    } catch (error) {
        res.status(500)
        req.body={
            successful:false,
            message: "Server error in updating my_profile - failed!"
        }
    }
    
}

export async function get_profilo(req:Request, res:Response, next: NextFunction) {
    try {
        mongoose.connect(process.env.DB_CONNECTION_STRING)
        /**
         * Restituisce i dati "pubblici" di un profilo
         * si potrebbe fare un controllo dei permessi tramite token
         * questo dipende se bisogna essere autenticati per ottenere il profilo
         * 
         * l'alternativa è non autenticarsi, utile per recuperare i singoli profili del catalogo
         * sarebbe meglio autenticato così si possono restituire cose come il diario, ma bisogna determinare i permessi
         */
        let richiedente:ICliente|ITerapeuta
        if(req.body.loggedUser.ruolo==1)
            richiedente= await Cliente.findById(req.body.loggedUser._id).exec()
        else if(req.body.loggedUser.ruolo==2)
            richiedente = await Terapeuta.findById(req.body.loggedUser._id).exec()
        else{
            res.status(403)
            req.body={
                successful:false,
                message:"Invalid role!"
            }
            next()
            return
        }

        let utente:IUtente|ICliente|ITerapeuta = await Utente.findById(req.params.id).exec()
        if(!utente){
            res.status(404),
            req.body={
                successful:false,
                message:"User not found!"
            }
            next()
            return
        }
        if(utente.ruolo==1)
            utente = await Cliente.findById(req.params.id,'username ruolo nome cognome email foto_profilo data_nascita diario')
        else if(utente.ruolo==2)
            utente = await Terapeuta.findById(req.params.id,'username ruolo nome cognome email cf foto_profilo data_nascita limite_clienti indirizzo recensioni')
        
        /**
         * 
         * CHECK PERMESSI:
         * Il terapeuta può vedere il profilo dei suoi clienti
         * Il cliente può vedere il profilo di ogni terapeuta
         * 
         */

        if(richiedente.ruolo==utente.ruolo||((richiedente instanceof Terapeuta)&&!(richiedente as ITerapeuta).associati.includes(req.params.id))){
            res.status(403)
            req.body={
                successful: false,
                message: "Request denied!"
            }
            next()
            return
        }

        res.status(200)
        req.body={
            successful:true,
            message:"Profile obtained successfully!",
            profilo:utente
        }
        next()
    } catch (error) {
        res.status(500)
        req.body={
            successful:false,
            message:"Server error in retrieving profile - failed!"
        }
        next()
    }
}

/**
 * 
 * TODO: aggiungere unique ai campi univoci degli schemi
 *       trovare il punto dove chiamare SCHEMA.CreateIndex() per inizializzare gli indici (?)
 */
async function remove_associazione_precedente(id_cliente: string) {
    console.log("REMOVE ASSOCIAZIONE PRECEDENTE")
    try{
        await mongoose.connect(process.env.DB_CONNECTION_STRING)
        console.log("dbconnesso")

        const cliente=await Cliente.findById(id_cliente).exec() 
        if(cliente.associato==""){
            console.log("client already free")
            return
        }else{
            const id_terapeuta=cliente.associato
            const terapeuta=await Terapeuta.findByIdAndUpdate(id_terapeuta, {$pull:{associati:id_cliente}},{new:true}).exec()
            if((terapeuta.associati.includes(cliente._id.toString()))){
                console.log("remove from Therapist failed")
                return
            }else{
                await remove_prenotazioni_if_disassociato(id_cliente, id_terapeuta)
            }
            console.log("remotion successful")
        }
    }catch (err){
        console.log("remove association failed")
    }
    
}


export async function associazione(req:Request,res:Response,next:NextFunction) {
    
    const id_cliente=req.body.loggedUser._id
    const id_terapeuta=req.params.id
    if (!id_cliente || !id_terapeuta){
        res.status(400)
        req.body={
            successful: false,
            message: "Not enough arguments!"
        }
        next()
    } 

    try{
        await mongoose.connect(process.env.DB_CONNECTION_STRING)

        let terapeuta=await Terapeuta.findById(id_terapeuta).exec()     //recupero dal db i due utenti, per verificarne esistenza e campi
        let cliente= await Cliente.findById(id_cliente).exec()

        if(!(terapeuta&&cliente)){ 
            res.status(404)
            req.body={
                successful: false,
                message: "User not found!"
            }
            next()
            return      //i return sono necessari: altrimenti rischia di eseguire il resto del codice comunque bypassando il controllo
        }

        if(cliente.ruolo!=1 || terapeuta.ruolo!=2){
            res.status(403)
            req.body={
                successful: false,
                message: "Invalid role!"
            }
            next()
            return  
        }

        if(terapeuta.associati.length>=(terapeuta.limite_clienti as number)){
            res.status(409)
            req.body={
                successful: false,
                message: "Therapist full, impossible association!"
            }
            next()
            return  
        }


        /**
         * questo controllo permette di avere un cliente già associato ad un terapeuta ed associarlo ad un altro
         * se per disgrazia uno dei due campi non è stato salvato completamente (quindi riferimenti non matchati)
         * il test sull'associazione viene passato
         * quindi verrà scritto l'id del terapeuta nel cliente, e raddoppiato nel terapeuta
         * 
         * inoltre sperimentando ho trovato che "in" non funziona bene in questo caso (sotto chiamava comunque il rollback)
         * usare associati.includes sembra essere meglio
         */

        if(terapeuta.associati.includes(cliente._id.toString())&&cliente.associato==terapeuta._id.toString()){       
            res.status(409)
            req.body={
                successful:false,
                message: "Client and therapist already associated!"
            }
            next()
            return
        }

        //pulisce l'asssociazione precedente dal terapeuta precedente
        await remove_associazione_precedente(id_cliente)
        
        /**
         * Se il campo del cliente è vuoto o contiene un terapeuta diverso ci associo quello nuovo 
         *      
         *      se si effettua una seconda chiamata con gli stessi dati il sistema si autocorregge (passo il check sopra e sovrascrivo correttamente)
         */

        if(cliente.associato!=terapeuta._id.toString())
            cliente = await Cliente.findByIdAndUpdate(id_cliente, {associato:id_terapeuta},{new:true}).exec()
        
        //lancio un errore se non dovesse andare a buon fine la scrittura nel db
        if(cliente.associato!=id_terapeuta){
            res.status(500)
            req.body={
                successful: false,
                message: "Server error in association - failed!"
            }
            next()
            return
        }

        /**
         * Stessa logica del cliente: se il cliente è associato ma non appare nell'array, passo il check e lo scrivo nell'array
         */
        if(!(terapeuta.associati.includes(cliente._id.toString())))
            terapeuta = await Terapeuta.findByIdAndUpdate(id_terapeuta, {$push:{associati:id_cliente}}, {new:true}).exec()
        
        /**
         * 
         * ROLLBACK: se non si è riusciti a scrivere nel terapeuta il cliente, 
         * si elimina da entrambi il riferimento all'altro
         * una nuova chiamata potrà essere ritentata
         * 
         * la parte di ROLLBACK può essere sostituita da rimuovi_associazione, che 
         * fa le stesse esatte cose
         * 
         */
        if(!(terapeuta.associati.includes(cliente._id.toString()))){
            //rollback associazione utente, che si suppone funzioni -> rimuovo eventuali link pendenti
            await Cliente.findByIdAndUpdate(id_cliente, {associato:""}).exec()
            await Terapeuta.findByIdAndUpdate(id_terapeuta,{$pull:{associati:id_cliente}}) 
            res.status(500)
            req.body={
                successful: false,
                message: "Server error in association - failed!"
            }
            next()
            return
        }
        res.status(200)
        req.body={
            successful:true,
            message:"Association successfully done!" 
        }
        next()
        return
    } catch (err) {
        res.status(500)
        req.body={
            successfull:false,
            message:"Server error in association - failed!"
        }
        next()
    }
}

export async function rimuovi_associazione (req:Request, res:Response,next:NextFunction){
    /**
     * 
     * L'utente autenticato manda una richiesta di disassociazione con parametro l'id della controparte
     * Essendo autenticato, si determina il tipo di utente grazie al ruolo e si determina di conseguenza il tipo della controparte
     */
    let id_cliente:string, id_terapeuta:String
    if(req.body.loggedUser.ruolo==1){
        id_cliente=req.body.loggedUser._id
        id_terapeuta=req.params.id
    }
    else if(req.body.loggedUser.ruolo==2){
        id_terapeuta=req.body.loggedUser._id
        id_cliente=req.params.id
    }
    else{
        res.status(403)
        req.body={
            successful:false,
            message:"Invalid role!"
        }
        next()
        return
    }

    try {
        await mongoose.connect(process.env.DB_CONNECTION_STRING)

        let cliente= await Cliente.findOne({_id:id_cliente, associato:id_terapeuta}).exec()
        let terapeuta = await Terapeuta.findOne({_id:id_terapeuta, associati:id_cliente}).exec()
        
        if(!(cliente&&terapeuta)){
            res.status(404)
            req.body={
                successful:false,
                message:"User not found!"
            }
        }
        cliente = await Cliente.findOneAndUpdate({_id:id_cliente, associato:id_terapeuta},{associato:""},{new:true}).exec()
        terapeuta = await Terapeuta.findOneAndUpdate({_id:id_terapeuta, associati:id_cliente},{$pull:{associati:id_cliente}},{new:true}).exec()
        await remove_prenotazioni_if_disassociato(id_cliente, id_terapeuta)

        res.status(200)
        req.body={
            successful:true,
            message:"Association successfully removed!"
        }
    } catch (error) {
        res.status(500)
        req.body={
            successful:false,
            message:"Server error in association removal - failed!"
        }
    }
    next()
}