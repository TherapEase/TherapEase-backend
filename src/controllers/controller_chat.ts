import { Request,Response,NextFunction } from "express";
import mongoose from 'mongoose'

import { Utente } from "../schemas/utente_schema";
import { Chat, Messaggio } from "../schemas/chat_schema";

export async function open_chat(req:Request,res:Response,next:NextFunction) {
    /**
     * route loggata, l'utente è nel body
     * il supporto tecnico viene scelto casualmente tra quelli che non hanno chat aperte
     */
    try {
        await mongoose.connect(process.env.DB_CONNECTION_STRING)
        //ricerca gli utenti st che non sono in una chat aperta 
        const st = await Utente.find({ruolo:3, _id:{$nin: await Chat.find({risolta:false},'supporto_tecnico').exec()}}).exec()
        console.log(st)
        if(!st.length){
            res.status(403)
            req.body={
                successful:false,
                message:"No support available!"
            }
            next()
            return
        }
        const chat = new Chat({
            supporto_tecnico: st[Math.floor(Math.random()*st.length)]._id,
            utente: req.body.loggedUser._id,
            data_apertura:Date.now()
        })
        await Chat.create(chat)
        res.status(200)
        req.body={
            successful:true,
            message:"Created new chat",
            chat_id:chat._id
        }
        next()
        return
    } catch (error) {
        res.status(500)
        req.body={
            successful:false,
            message:"Internal server error"
        }
        console.log(error)
        next()
        return
    }
}

export async function get_nuovi_messaggi(req:Request,res:Response,next:NextFunction){
    /**
     * ritorna i messaggi non letti nella chat
     * l'id della chat è specificato nei parametri
     */

    const id_chat = req.params.id_chat
    if(!id_chat){
        res.status(400)
        req.body={
            successful:false,
            message: "Not enough arguments!"
        }
        next()
        return
    }
    try {
        await mongoose.connect(process.env.DB_CONNECTION_STRING)
        if(! await Chat.findById(id_chat).exec()){
            res.status(404)
            req.body={
                successful:false,
                message:"This chat doesn't exist"
            }
            next()
            return
        }
        //let messaggi = await Messaggio.find({mittente:mittente,destinatario:req.body.loggedUser._id,letto:false}).exec()
        let chat = await Chat.findOneAndUpdate({_id:id_chat,risolta:false,"messaggi.letto":false},{$set:{"messaggi.$.letto":true}}).exec()
        //let chat = await Chat.findOne({_id:id_chat,risolta:false, "messaggi.letto":false}).exec()
        //manca la conferma di lettura
        
        if(!chat){
            res.status(200)
            req.body={
                successful:true,
                message:"No new messages",
            }
            next()
            return
        }
        res.status(200)
        req.body={
            successful:true,
            message:"Unread messages retrieved successfully",
            chat:chat
        }
        next()
        return
    } catch (error) {
        res.status(500)
        req.body={
            successful:false,
            message:"Internal Server Error"
        }
        console.log(error)
        next()
        return
    }
}
export async function get_all_messaggi(req:Request,res:Response,next:NextFunction) {
    const id_chat = req.params.id_chat
    if(!id_chat){
        res.status(400)
        req.body={
            successful:false,
            message: "Not enough arguments!"
        }
        next()
        return
    }
    try {
        await mongoose.connect(process.env.DB_CONNECTION_STRING)
        let chat = await Chat.findByIdAndUpdate(id_chat,{"messaggi.letto":true}).exec()
        if(!chat){
            res.status(404)
            req.body={
                successful:false,
                message:"This chat doesn't exist"
            }
            next()
            return
        }
        if(!chat.messaggi){
            res.status(200)
            req.body={
                successful:true,
                message:"No messages found",
            }
            next()
            return
        }
        res.status(200)
        req.body={
            successful:true,
            message:"Messages retrieved successfully",
            chat:chat
        }
        next()
        return
    } catch (error) {
        res.status(500)
        req.body={
            successful:false,
            message:"Internal Server Error"
        }
        next()
        return
    }
}
export async function send_messaggio(req:Request,res:Response,next:NextFunction) {
    /**
     * Mittente loggato,
     * id_chat parametro query
     * testo nel body
     */

    const testo = req.body.testo
    const id_chat = req.params.id_chat
    const mittente = req.body.loggedUser._id

    if(!testo||!id_chat){
        res.status(400)
        req.body={
            successful:false,
            message:"Not enough arguments!"
        }
        next()
        return
    }
    try {
        await mongoose.connect(process.env.DB_CONNECTION_STRING)
        let chat = await Chat.findById(id_chat).exec() 
        if(!chat){
            res.status(404)
            req.body={
                successful:false,
                message:"This chat doesn't exist"
            }
            next()
            return
        }
        await chat.updateOne({$push:{messaggi:new Messaggio(testo,new Date(Date.now()),mittente)}}).exec()
        
        res.status(200)
        req.body={
            successful:true,
            message:"Message added successfully"
        }
        next()
        return
    } catch (error) {
        res.status(500)
        req.body={
            successful:false,
            message:"Internal Server Error"
        }
        next()
        return
    }
}