import { Request,Response,NextFunction } from 'express'
import {Cliente, ICliente} from '../schemas/cliente_schema'
import {Utente,IUtente} from '../schemas/utente_schema'
import mongoose from 'mongoose'
import dotenv from 'dotenv'
import { Terapeuta } from '../schemas/terapeuta_schema'
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

export async function get_info_utente(req:Request,res:Response,next:NextFunction){
    // console.log("in profilo utente")
    // console.log(req.params.id)
    // console.log(req.body.loggedUser._id)
    // console.log(req.body)
    // console.log(req.params)
    await mongoose.connect(process.env.DB_CONNECTION_STRING)
    if(req.params.id==req.body.loggedUser._id){     //check dei permessi: per ora un profilo può accedere ai suoi dati-> id richiesto ed _id nel token coincidono
        res.status(200)
        req.body={
            successful:true,
            message: "id and token match!",
            profile: await Utente.findOne({_id:req.params.id},'username ruolo nome cognome email email_confermata cf foto_profilo data_nascita n_gettoni associato').exec()
        }
        next()
    }
    else res.status(400).json({
        successful:false,
        messaggio:"failed to obtain profile",
        // requested_id:req.params.id,
        // logged_id: req.body.loggedUser._id
    })
}