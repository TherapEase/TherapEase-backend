import { Request,Response,NextFunction } from 'express'
import {Cliente, ICliente} from '../schemas/cliente_schema'
import {Utente,IUtente} from '../schemas/utente_schema'
import mongoose, { mongo } from 'mongoose'
import dotenv from 'dotenv'
import { Terapeuta,ITerapeuta } from '../schemas/terapeuta_schema'
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
            username: utente_schema.username,
            ruolo:utente_schema.ruolo
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
            username: utente_trovato.username,
            ruolo:utente_trovato.ruolo
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

export async function get_my_profilo(req:Request,res:Response,next:NextFunction){
    /**
     * 
     * Questa funzione è dedita al recupero del proprio profilo per la visualizzazione delle informazioni personali
     * La richiesta contiene il token decodificato-> _id,username,ruolo
     */

    try {
        await mongoose.connect(process.env.DB_CONNECTION_STRING)
        let utente: IUtente|ITerapeuta
        if(req.body.loggedUser.ruolo==1)
            utente = await Cliente.findById(req.body.loggedUser._id,'username ruolo nome cognome email email_confermata cf foto_profilo data_nascita n_gettoni associato').exec()
        else if (req.body.loggedUser.ruolo==2)
            utente = await Terapeuta.findById(req.body.loggedUser._id,'username ruolo nome cognome email email_confermata cf foto_profilo data_nascita associati abilitato limiteClienti indirizzo').exec()
        else{
            res.status(400)
            req.body={
                successful:false,
                message:"Invalid role"
            }
            next()
            return
        }
        res.status(200)
        req.body={
            successful:true,
            message:"Profile obtained successfully",
            profile:utente
        }
        next()    
    } catch (error) {
        res.status(500)
        req.body={
            successful:false,
            message:"Internal error: "+error
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
     * limiteClienti
     * indirizzo
     */

    try {
        await mongoose.connect(process.env.DB_CONNECTION_STRING)
        if(req.body.loggedUser.ruolo==1){
            const cliente = await Cliente.findById(req.body.loggedUser._id,{}).exec()
    
            if(!cliente){
                res.status(400)
                req.body={
                    successful:false,
                    message:"Cliente not found"
                }
                next()
                return
            }
    
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
    
            if(!terapeuta){
                res.status(400)
                req.body={
                    successful:false,
                    message:"Terapeuta not found"
                }
                next()
                return
            }
    
            let updated_data ={
                nome: req.body.nome?req.body.nome : terapeuta.nome,
                cognome: req.body.cognome?req.body.cognome : terapeuta.nome,
                email:req.body.email?req.body.email : terapeuta.email,
                email_confermata:req.body.email?false:true,
                cf:req.body.cf?req.body.cf : terapeuta.cf,
                foto_profilo:req.body.foto_profilo?req.body.foto_profilo : terapeuta.foto_profilo,
                data_nascita: req.body.data_nascita?req.body.data_nascita : terapeuta.data_nascita,
                limiteClienti: req.body.limiteClienti?req.body.limiteClienti : terapeuta.limiteClienti,
                indirizzo:req.body.data_nascita?req.body.indirizzo : terapeuta.indirizzo
            }
    
            const updated_cliente = await Terapeuta.findByIdAndUpdate(terapeuta._id,{
                nome:updated_data.nome,
                cognome:updated_data.cognome,
                email:updated_data.email,
                email_confermata:updated_data.email_confermata,
                cf:updated_data.cf,
                foto_profilo:updated_data.foto_profilo,
                data_nascita:updated_data.data_nascita,
                limiteClienti: updated_data.limiteClienti,
                indirizzo:updated_data.indirizzo
            },{new:true}).exec()
        }
        res.status(200)
        req.body={
            successful:true,
            message:"fields updated correctly"
        }
        next()
        return
    } catch (error) {
        res.status(500)
        req.body={
            successful:false,
            message: "Internal error " + error
        }
    }
    
}