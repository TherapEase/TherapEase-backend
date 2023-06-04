import { Request,Response,NextFunction, Router } from "express";
import { get_nuovi_messaggi, send_messaggio } from "../controllers/controller_chat";
import { tokenCheck } from "../controllers/token_checker";

export const chat_router = Router()

chat_router.post('/send_message',tokenCheck, send_messaggio,(req:Request,res:Response)=>{
    res.json(req.body)
})

chat_router.get('/messages/new/:mittente',tokenCheck,get_nuovi_messaggi,(req:Request,res:Response)=>{
    res.json(req.body)
})