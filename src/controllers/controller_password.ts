import {Request,Response,NextFunction} from 'express'
import mongoose from 'mongoose'
import bcrypt from 'bcrypt'
import generator from 'generate-password'

import {Utente,IUtente} from '../schemas/utente_schema'
import {Cliente, ICliente} from '../schemas/cliente_schema'
import { Terapeuta,ITerapeuta } from '../schemas/terapeuta_schema'

import { check_and_hash } from './password_hasher'
import { send_mail } from './gmail_connector'



export async function recupero_password(req:Request,res:Response){
    const username = req.body.username
    const mail = req.body.email_address
    const cf= req.body.codice_fiscale

    if(!(username&&mail&&cf)){
        res.status(400).json({
            successful:false,
            message:"Please specify all fields"
        })
    }

    try {
        await mongoose.connect(process.env.DB_CONNECTION_STRING)
        const utente = await Utente.findOne({username:username}).exec()
        if(!utente){
            res.status(404).json({
                successful:false,
                message:"User not found!"
            })
        }

        const new_password = generator.generate({
            length:12,
            numbers:true,
            symbols:true,
            exclude:'"#^()+_\-=}{[\]|:;"/.><,`~"',
            strict:true
        })
        console.log(new_password)
        const hashed_password = await check_and_hash(new_password)
        let utente_completo
        if(utente.ruolo==1)
            utente_completo = await Cliente.findOneAndUpdate({username:username, email:mail,cf:cf},{password:hashed_password}).exec()      
        else if(utente.ruolo==2)
            utente_completo = await Terapeuta.findOneAndUpdate({username:username, email:mail,cf:cf},{password:hashed_password}).exec()
        
        if(!utente_completo) {
            res.status(404).json({
                successful:false,
                message: "User not found!"
            })
        }

        send_mail("CAMBIO PASSWORD","La tua nuova password è "+new_password,utente_completo.email.toString())
        res.status(200).json({
            successful:true,
            message:"Password restored correctly!"
        })
    } catch (error) {
        res.status(500).json({
            successful:false,
            message:"Server error in password recovery - failed!"
        })
    }
}

export async function cambio_password(req:Request,res:Response) {
    try {

        let password = req.body.password
        if(!password){
            res.status(400).json({
                successful:false,
                message:"Password not specified!"
            })
        }
        await mongoose.connect(process.env.DB_CONNECTION_STRING)
        let utente = await Utente.findById(req.body.loggedUser._id).exec()
        if(await bcrypt.compare(password,utente.password.toString())){
            res.status(409).json({
                successful:false,
                message:"The password provided is the same as the old one"
            })
        }
        let hashed_password = await check_and_hash(password)
        //ricerco l'utente ed inserisco la password hashata
        utente = await Utente.findByIdAndUpdate(req.body.loggedUser._id,{password:hashed_password}).exec()

        res.status(200).json({
            successful:true,
            message:"Password successfully changed!"
        })
    } catch (error) {
        res.status(500).json({
            successful:false,
            message:"Server error in password change - failed!"
        })
    }
}