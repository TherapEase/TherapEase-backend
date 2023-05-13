import { json } from 'body-parser';
import {Router,Request,Response} from 'express'
import { registrazione } from '../controllers/controller_utente';
//import cors from 'cors';

export const defaultRoute = Router()

defaultRoute.get('/',(req,res)=>{
    res.send("sono nel router");
})

defaultRoute.use('/test',(req:Request,res:Response)=>{
    res.json(req.body)
})
defaultRoute.post('/registrazione', async (req:Request,res:Response)=>{
    let risposta= await registrazione(req,res)
    res.json(risposta)
})