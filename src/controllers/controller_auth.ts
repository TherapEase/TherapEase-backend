import {Request, Response} from 'express'
import mongoose from 'mongoose'
import jwt, { JwtPayload } from 'jsonwebtoken'

import {Utente,IUtente} from '../schemas/utente_schema'
import {Cliente, ICliente} from '../schemas/cliente_schema'
import { Terapeuta } from '../schemas/terapeuta_schema'
import { send_mail } from './gmail_connector'

export async function registrazione(req:Request,res:Response) {
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
   
   if(!username||!password||!ruolo||!nome||!cognome||!email||!cf||fp||!dn) {       
    res.status(400).json({
        successful:false,
        message:"Not enough arguments!"
    })
   }
   else if (ruolo<1||ruolo>2) {
    res.status(403).json({
        successful:false,
        message:"Invalid role!"
    })
   }
   

   try{
    await mongoose.connect(process.env.DB_CONNECTION_STRING)
    let utente_presente = await Utente.findOne({username:username}).exec()    
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
                res.status(400).json({
                    successful:false,
                    message:"Not enough arguments!"
                })
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
        await send_confirmation_mail(utente_schema._id.toString(),utente_schema.email.toString())
        const token = createToken(utente_schema._id.toString(),utente_schema.username.toString(),utente_schema.ruolo) 

        res.status(200).json({
            successful:true,
            message:"User registered correctly!",
            token : token
        })
    }else {
        res.status(409).json({
            successful:false,
            message:"User already exists!"
        })
    }
   }catch(err){
        res.status(500).json({
            successful: false,
            message:"Server error in registration - failed!"
        })
   }
}   


export async function login(req:Request,res:Response) {
    const username=req.body.username
    const password=req.body.password

    // controllo su campi mancanti
    if (!username || !password){
        res.status(400).json({
            successful: false,
            message: "Not enough arguments!"
        })
    } 

    try {
        // recupero utente dal database
        await mongoose.connect(process.env.DB_CONNECTION_STRING)
        let utente_trovato = await Utente.findOne({username: username}).exec()

        // se non esiste, ritorno un errore
        if (!utente_trovato){
            res.status(404).json({
                successful: false,
                message: "User not found!"
            })
        };

        // controllo la password
        const modello_utente = new Utente<IUtente>(utente_trovato)
        const passwordCorretta= await modello_utente.checkPassword(password)

        if (!passwordCorretta){
            res.status(401).json({
                successful:false,
                message:"Incorrect password!"
            })
        };
    
        //creo il token aggiungendo i vari campi utili
        const token = createToken(utente_trovato._id.toString(),utente_trovato.username.toString(),utente_trovato.ruolo)
        
        //recupero il cliente per inviare la mail di conferma nel caso non fosse confermato
        let utente_completo
        if(utente_trovato.ruolo==1)
            utente_completo = await Cliente.findById(utente_trovato._id).exec()
        else if (utente_trovato.ruolo==2)
            utente_completo = await Terapeuta.findById(utente_trovato._id).exec()
        if (utente_trovato.ruolo!=4  && utente_trovato.ruolo!=3){
            if(!utente_completo.mail_confermata)
                await send_confirmation_mail(utente_completo._id.toString(),utente_completo.email.toString())
        }
        res.status(200).json({
            successful:true,
            message:"User authenticated!",
            token: token 
        })
    } catch (err) {
        res.status(500).json({
            successful:false,
            message:"Server error in login - failed!"
        })
    }
}

function createToken(_id:string, username:string, ruolo:Number):string{
    return jwt.sign({
        _id:_id,
        username:username,
        ruolo:ruolo
    },process.env.TOKEN_SECRET,{expiresIn:"2 days"})
}

async function send_confirmation_mail(_id:string, email:string){
    const ver_token = jwt.sign({
        _id:_id,
        email: email
    },process.env.TOKEN_SECRET,{expiresIn:"1 day"})
    const testo="Clicca sul link seguente per verificare il tuo indirizzo di posta elettronica: "+"REDIRECT URL"+ver_token //mettere il link a cui si viene ridiretti al front
    await send_mail("Verify your email address",testo,email)
}

export async function conferma_mail(req:Request, res:Response){
    const ver_token = req.params.ver_token
    if(!ver_token){
        res.status(400).json({
            successful:false,
            message:"No token provided"
        })
    }
    const decoded = jwt.verify(ver_token,process.env.TOKEN_SECRET) as JwtPayload
    if(!decoded){
        res.status(403).json({
            successful:false,
            message:"The provided token isn't valid!"
        })
    }
    try {
        await mongoose.connect(process.env.DB_CONNECTION_STRING)
        let utente
        if(req.body.loggedUser.ruolo==1)
            utente= Cliente.findOneAndUpdate({_id:decoded._id,email:decoded.email,mail_confermata:false},{mail_confermata:true}).exec()
        else if (req.body.loggedUser.ruolo==2)
            utente = Terapeuta.findOneAndUpdate({_id:decoded._id,email:decoded.email,mail_confermata:false},{mail_confermata:true}).exec()
        if(!utente){
            res.status(404).json({
                successful:false,
                message:"User not found"
            })
        }
        res.status(200).json({
            successful:true,
            message:"Email verified"
        })
    } catch (error) {
        res.status(500).json({
            successful:false,
            message:"Internal server error in mail verification"
        })
    }
}
