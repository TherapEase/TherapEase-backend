import { Request,Response,NextFunction, Router } from "express";
import { get_all_messaggi, get_nuovi_messaggi, send_messaggio } from "../controllers/controller_chat";
import { tokenCheck } from "../controllers/token_checker";
import { io } from "../server";

export const chat_router = Router()

chat_router.post('/send_message',tokenCheck, send_messaggio,(req:Request,res:Response)=>{
    io.emit('message',req.body)
    res.json(req.body)
})

chat_router.get('/messages/new/:mittente',tokenCheck,get_nuovi_messaggi,(req:Request,res:Response)=>{
    res.json(req.body)
})

chat_router.get('messages/all/:mittente',tokenCheck,get_all_messaggi,(req:Request,res:Response)=>{
    res.json(req.body)
})