import { json } from 'body-parser';
import {Router,Request,Response,NextFunction} from 'express'
import { registrazione } from '../controllers/controller_utente';
import { login } from '../controllers/controller_utente';
import { tokenCheck } from '../controllers/token_checker';
import { send_mail } from '../controllers/gmail_connector';
import { send } from 'process';
//import cors from 'cors';

export const defaultRoute = Router()

defaultRoute.get('/',(req,res)=>{
    res.send("sono nel router");
})

defaultRoute.use('/test',(req:Request,res:Response)=>{
    res.json(req.body)
})
defaultRoute.post('/registrazione',registrazione,async (req:Request,res:Response)=>{
    res.json(req.body)
})
defaultRoute.post('/login', login ,(req:Request,res:Response)=>{
    res.json(req.body)
})

defaultRoute.use('/authexample',tokenCheck,(req:Request,res:Response)=>{
    res.status(200).json({
        successful:true,
        message: "token verification ok",
        loggedUser: req.body.loggedUser
    })
})

defaultRoute.post('/provamail',async (req:Request,res:Response)=>{
   await send_mail(req.body.oggetto, req.body.testo, req.body.destinatario)
   res.send("ok")
})