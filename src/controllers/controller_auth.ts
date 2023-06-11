import {Request, Response} from 'express'
import jwt, { JwtPayload } from 'jsonwebtoken'

import {Utente,IUtente} from '../schemas/utente_schema'
import {Cliente, ICliente} from '../schemas/cliente_schema'
import { Terapeuta } from '../schemas/terapeuta_schema'
import { send_mail } from '../services/gmail_connector'

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
   if(!username||!password||!ruolo||!nome||!cognome||!email||!cf||!dn) {       
    res.status(400).json({
        successful:false,
        message:"Not enough arguments!"
    })
    return
    return
   }
   else if (ruolo<1||ruolo>2) {
    res.status(403).json({
        successful:false,
        message:"Invalid role!"
    })
    return
    return
   }
   

   try{
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
            await Cliente.create(utente_schema)
        }
        else if (ruolo==2){
            if(!doc||!lim){
                res.status(400).json({
                    successful:false,
                    message:"Not enough arguments!"
                })
                return
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
            await Terapeuta.create(utente_schema)
        }
        await send_confirmation_mail(utente_schema._id.toString(),utente_schema.email.toString(),utente_schema.ruolo.valueOf())
        //se fallisce non è un problema, verrà fatto un nuovo tentativo al prossimo login, non mi sembra corretto fermare il tutto perché ha fallito l'invio mail  
        const token = createToken(utente_schema._id.toString(),utente_schema.username.toString(),utente_schema.ruolo) 

        res.status(200).json({
            successful:true,
            message:"User registered correctly!",
            token : token
        })
        return
    }else {
        res.status(409).json({
            successful:false,
            message:"User already exists!"
        })
        return
    }
   }catch(err){
        res.status(500).json({
            successful: false,
            message:"Server error in registration - failed!"
        })
        return
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
        return
    } 

    try {
        // recupero utente dal database
        let utente_trovato = await Utente.findOne({username: username}).exec()

        // se non esiste, ritorno un errore
        if (!utente_trovato){
            res.status(404).json({
                successful: false,
                message: "User not found!"
            })
            return
        };

        // controllo la password
        const modello_utente = new Utente<IUtente>(utente_trovato)
        const passwordCorretta= await modello_utente.checkPassword(password)

        if (!passwordCorretta){
            res.status(401).json({
                successful:false,
                message:"Incorrect password!"
            })
            return
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
                await send_confirmation_mail(utente_completo._id.toString(),utente_completo.email.toString(), utente_completo.ruolo.valueOf()) //come sopra
        }
        res.status(200).json({
            successful:true,
            message:"User authenticated!",
            token: token 
        })
        return
    } catch (err) {
        res.status(500).json({
            successful:false,
            message:"Server error in login - failed!"
        })
        return
    }
}

export function createToken(_id:string, username:string, ruolo:Number):string{
    return jwt.sign({
        _id:_id,
        username:username,
        ruolo:ruolo
    },process.env.TOKEN_SECRET,{expiresIn:"2 days"})
}

async function send_confirmation_mail(_id:string, email:string, ruolo:number){
    try {
        const ver_token = jwt.sign({
            _id:_id,
            email: email,
            ruolo: ruolo
        },process.env.TOKEN_SECRET,{expiresIn:"1 day"})
        const testo="Clicca sul link seguente per verificare il tuo indirizzo di posta elettronica: "+process.env.DEPLOY_BACK+'conferma_mail/'+ver_token //mettere il link a cui si viene ridiretti al front
        if(!await send_mail("Verify your email address",testo,email)) return false
        return true
    } catch (error) {
        return false
    }
}

export async function conferma_mail(req:Request, res:Response){
    const ver_token = req.params.ver_token
    let decoded
    try {
        decoded = jwt.verify(ver_token,process.env.TOKEN_SECRET) as JwtPayload    
    } catch (error) {
        res.status(403).json({
            successful:false,
            message:"The provided token isn't valid!"
        })
        return
    }
    try {
        let utente
        if(decoded.ruolo==1)
            utente= await Cliente.findOneAndUpdate({_id:decoded._id,email:decoded.email,mail_confermata:false},{mail_confermata:true}).exec()
        else if (decoded.ruolo==2)
            utente = await Terapeuta.findOneAndUpdate({_id:decoded._id,email:decoded.email,mail_confermata:false},{mail_confermata:true}).exec()
        if(!utente){
            res.status(404).json({
                successful:false,
                message:"User not found"
            })
            return
        }
        res.status(200).json({
            successful:true,
            message:"Email verified"
        })
        return
    } catch (error) {
            res.status(500).json({
            successful:false,
            message:"Internal server error in mail verification"
        })
        return
    }
}
