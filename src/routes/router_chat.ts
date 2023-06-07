import { Request,Response,NextFunction, Router } from "express";
import { close_chat, get_all_messaggi, get_nuovi_messaggi, get_open_chats, open_chat, send_messaggio } from "../controllers/controller_chat";
import { tokenCheck } from "../controllers/token_checker";
import { io } from "../server";

export const chat_router = Router()

chat_router.get('/chat/nuova_chat',tokenCheck,open_chat,(req:Request,res:Response)=>{
    res.json(req.body)
})
chat_router.get('/chat/aperte',tokenCheck,get_open_chats,(req:Request,res:Response)=>{
    res.json(req.body)
})
chat_router.get('/chat/:id_chat/chiudi',tokenCheck,close_chat,(req:Request,res:Response)=>{
    res.json(req.body)
})

chat_router.post('/chat/:id_chat/invia_messaggio',tokenCheck, send_messaggio,(req:Request,res:Response)=>{
    io.emit('message',req.body)
    console.log("messaggio arrivato")
    res.json(req.body)
})

chat_router.get('/chat/:id_chat/non_letti',tokenCheck,get_nuovi_messaggi,(req:Request,res:Response)=>{
    res.json(req.body)
})

chat_router.get('/chat/:id_chat/messaggi',tokenCheck,get_all_messaggi,(req:Request,res:Response)=>{
    res.json(req.body)
})