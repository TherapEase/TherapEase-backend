import { json } from 'body-parser';
import {Router,Request,Response} from 'express'
import { login } from '../controllers/controller_utente';
import { tokenCheck } from '../controllers/token_checker';
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

defaultRoute.use('/authexample',tokenCheck,(req:Request,res:Response)=>{
    res.status(200).json({
        status:200,
        successful:true,
        message: "token verification ok",
        loggedUser: req.body.loggedUser
    })
})