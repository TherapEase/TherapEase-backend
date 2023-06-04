import { Request,Response,NextFunction } from "express";
import mongoose from 'mongoose'

import { Messaggio, IMessaggio } from "../schemas/messaggio_schema";
import { Utente } from "../schemas/utente_schema";

export async function get_nuovi_messaggi(req:Request,res:Response,next:NextFunction){
    /**
     * ritorna i messaggi non letti per il destinatario
     * destinatario= utente autenticato
     * mittente = nei parametri della query, come _id
     * 
     */

    const mittente = req.params.mittente
    if(!mittente){
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
        if(! await Utente.findById(mittente).exec()){
            res.status(404)
            req.body={
                successful:false,
                message:"This user doesn't exist"
            }
            next()
            return
        }
        let messaggi = await Messaggio.find({mittente:mittente,destinatario:req.body.loggedUser._id,letto:false}).exec()
        await Messaggio.updateMany({mittente:mittente,destinatario:req.body.loggedUser._id,letto:false},{$set:{letto:true}}).exec()
        if(!messaggi){
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
            messaggi:messaggi
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
export async function get_all_messaggi(req:Request,res:Response,next:NextFunction) {
    const mittente = req.params.mittente
    if(!mittente){
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
        if(! await Utente.findById(mittente).exec()){
            res.status(404)
            req.body={
                successful:false,
                message:"This user doesn't exist"
            }
            next()
            return
        }
        let messaggi = await Messaggio.find({mittente:mittente,destinatario:req.body.loggedUser._id}).exec()
        await Messaggio.updateMany({mittente:mittente,destinatario:req.body.loggedUser._id},{$set:{letto:true}}).exec()
        if(!messaggi){
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
            messaggi:messaggi
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
     * POST con: testo, destinatario
     * Il mittente è l'utente loggato
     * La data è Date.now()
     */

    const testo = req.body.testo
    const destinatario = req.body.destinatario
    const mittente = req.body.loggedUser._id

    if(!testo||!destinatario){
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
        if(! await Utente.findById(destinatario).exec()){
            res.status(404)
            req.body={
                successful:false,
                message:"This user doesn't exist"
            }
            next()
            return
        }
        let messaggio = await Messaggio.create(new Messaggio({
            testo:testo,
            data:Date.now(),
            mittente: mittente,
            destinatario:destinatario,
            letto:false
        }))
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