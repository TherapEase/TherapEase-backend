import { Request,Response,NextFunction } from 'express'
import {Cliente, ICliente} from '../schemas/cliente_schema'
import {Utente,IUtente} from '../schemas/utente_schema'
import mongoose from 'mongoose'
import dotenv from 'dotenv'
import { Terapeuta, ITerapeuta } from '../schemas/terapeuta_schema'
import jwt from 'jsonwebtoken'

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
   
   if(!username||!password||!ruolo||!nome||!cognome||!email||!cf||!fp||!dn) {       //si potrebbe far fare al catch usando i campi required 
    res.status(400)
    req.body = {
        successful:false,
        message:"Not enough arguments"
    }
   }
   else if (ruolo<1||ruolo>2) {
    res.status(400)
    req.body = {
        successful:false,
        message:"Invalid Role"
    }
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
                    message:"Not enough arguments"
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
                limiteClienti: lim,
                indirizzo:ind
            })
        }
        await utente_schema.save();
        // console.log("utente salvato")
        // console.log(utente_schema)

        const token = jwt.sign({
            _id: utente_schema._id.toString(),
            username: utente_schema.username
        },process.env.TOKEN_SECRET,{expiresIn: '50 years'})
        //in alernativa usare res.redirect(/login) e sfruttare il login handler
        res.status(200)
        req.body={
            successful:true,
            message:"user saved correctly",
            token : token
        }
    }else {
        res.status(400)
        req.body={
            successful:false,
            message:"User already exists"
        }
    }
   }catch(err){
        res.status(500)
        req.body={
            successful: false,
            message:"Internal Registration Error: "+err
        }
   }
   next()
}   


export async function login(req:Request,res:Response,next:NextFunction) {
    const username=req.body.username
    const password=req.body.password

    // controllo su campi mancanti
    if (!username || !password){
        res.status(400)
        req.body={
            successful: false,
            message: "Not enough arguments"
        }
    } 

    try {
        // recupero utente dal database
        await mongoose.connect(process.env.DB_CONNECTION_STRING)
        const utente_trovato = await Utente.findOne({username: username}).exec()

        // se non esiste, ritorno un errore
        if (!utente_trovato){
            res.status(400)
            req.body={
                successful: false,
                message: "User not found"
            }
        };

        // controllo la password
        const modello_utente = new Utente<IUtente>(utente_trovato)
        const passwordCorretta= await modello_utente.checkPassword(password)

        if (!passwordCorretta){
                res.status(400)
                req.body={
                    successfull:false,
                    message:"incorrect password"
                }
        };
    
        //creo il token aggiungendo i vari campi utili
        
        const token = jwt.sign({
            _id: utente_trovato._id.toString(),
            username: utente_trovato.username
        },process.env.TOKEN_SECRET,{expiresIn: '50 years'})
    
        // res.status(200).json({ success: true, token: token })
        res.status(200)
        req.body={
            successfull:true,
            message:"authenticated",
            token: token 
        }
    
    } catch (err) {
        res.status(500)
        req.body={
            successfull:false,
            message:"Internal Error: auth failed"+err
        }
    }
    next()
}

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
            message: "Not enough arguments"
        }
        next()
    } 

    try{
        await mongoose.connect(process.env.DB_CONNECTION_STRING)

        let terapeuta=await Terapeuta.findById(id_terapeuta).exec()     //recupero dal db i due utenti, per verificarne esistenza e campi
        let cliente= await Cliente.findById(id_cliente).exec()

        if(!(terapeuta&&cliente)){ 
            res.status(400)
            req.body={
                successful: false,
                message: "Error during users retrieval"
            }
            next()
            return      //i return sono necessari: altrimenti rischia di eseguire il resto del codice comunque bypassando il controllo
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
            res.status(400)
            req.body={
                successful:false,
                message: "Cliente already associated"
            }
            next()
            return
        }

        //pulisce l'asssociazione precedente dal terapeuta precedente
        await remove_associazione_precedente(id_cliente)
        //prova rimozione, poi viene reinserito
        //await remove_associazione(id_cliente, id_terapeuta)
        //return
        /**
         * Se il campo del cliente è vuoto o contiene un terapeuta diverso ci associo quello nuovo 
         *      
         *      se si effettua una seconda chiamata con gli stessi dati il sistema si autocorregge (passo il check sopra e sovrascrivo correttamente)
         */

        if(cliente.associato!=terapeuta._id.toString())
            cliente = await Cliente.findByIdAndUpdate(id_cliente, {associato:id_terapeuta},{new:true}).exec()
        
        //lancio un errore se non dovesse andare a buon fine la scrittura nel db
        if(cliente.associato!=id_terapeuta){
            res.status(400)
            req.body={
                successful: false,
                message: "Client association error"
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
            res.status(400)
            req.body={
                successful: false,
                message: "Therapist association error, possible incostistent state"
            }
            next()
            return
        }
        res.status(200)
        req.body={
            successfull:true,
            message:"association done!" 
        }
        next()
        return
    } catch (err) {
        res.status(500)
        req.body={
            successfull:false,
            message:"Internal Error: association failed "+err
        }
        next()
    }
}