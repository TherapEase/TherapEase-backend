import { json } from 'body-parser';
import {Router,Request,Response} from 'express'
import { login } from '../controllers/controller_utente';
//import cors from 'cors';

export const defaultRoute = Router()

defaultRoute.get('/',(req,res)=>{
    res.send("sono nel router");
})

defaultRoute.use('/test',(req:Request,res:Response)=>{
    res.json(req.body)
})

defaultRoute.post('/login', async (req:Request,res:Response)=>{
    const result= await login(req,res)
    res.status(result.status).json(result)
})