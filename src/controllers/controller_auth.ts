import {Request, Response,NextFunction} from 'express'
import mongoose from 'mongoose'
import jwt from 'jsonwebtoken'

import {Utente,IUtente} from '../schemas/utente_schema'
import {Cliente, ICliente} from '../schemas/cliente_schema'
import { Terapeuta,ITerapeuta } from '../schemas/terapeuta_schema'

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
        await Utente.create(utente_schema)

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
            next()
            return
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
            message:"Server error in login - failed!" + err
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
