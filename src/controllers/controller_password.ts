import {Request,Response,NextFunction} from 'express'
import mongoose, { mongo } from 'mongoose'
import {Utente,IUtente} from '../schemas/utente_schema'
import {Cliente, ICliente} from '../schemas/cliente_schema'
import { Terapeuta,ITerapeuta } from '../schemas/terapeuta_schema'
import generator from 'generate-password'
import { check_and_hash } from './password_hasher'
import { send_mail } from './gmail_connector'
import bcrypt from 'bcrypt'


export async function recupero_password(req:Request,res:Response,next:NextFunction){
    const username = req.body.username
    const mail = req.body.email_address
    const cf= req.body.codice_fiscale

    if(!(username&&mail&&cf)){
        res.status(400)
        req.body={
            successful:false,
            message:"Please specify all fields"
        }
    }

    try {
        await mongoose.connect(process.env.DB_CONNECTION_STRING)
        const utente = await Utente.findOne({username:username}).exec()
        if(!utente){
            res.status(404)
            req.body={
                successful:false,
                message:"User not found!"
            }
            next()
            return
        }

        const new_password = generator.generate({
            length:12,
            numbers:true,
            symbols:true,
            exclude:'"#^()+_\-=}{[\]|:;"/.><,`~"'
        })
        console.log(new_password)
        const hashed_password = await check_and_hash(new_password)
        let utente_completo
        if(utente.ruolo==1)
            utente_completo = await Cliente.findOneAndUpdate({username:username, email:mail,cf:cf},{password:hashed_password}).exec()      
        else if(utente.ruolo==2)
            utente_completo = await Terapeuta.findOneAndUpdate({username:username, email:mail,cf:cf},{password:hashed_password}).exec()
        
        if(!utente_completo) {
            res.status(404)
            req.body={
                successful:false,
                message: "User not found!"
            }
            next()
            return
        }

        send_mail("CAMBIO PASSWORD","La tua nuova password è "+new_password,utente_completo.email.toString())
        res.status(200)
        req.body={
            successful:true,
            message:"Password restored correctly!"
        }
        next()
        return
    } catch (error) {
        res.status(500)
        req.body={
            successful:false,
            message:"Server error in password recovery - failed!"
        }
    }
}

export async function cambio_password(req:Request,res:Response,next:NextFunction) {
    try {

        let password = req.body.password
        if(!password){
            res.status(400)
            req.body={
                successful:false,
                message:"Password not specified!"
            }
            next()
            return
        }
        
        await mongoose.connect(process.env.DB_CONNECTION_STRING)
        let utente = await Utente.findById(req.body.loggedUser._id).exec()
        if(await bcrypt.compare(password,utente.password.toString())){
            res.status(409)
            req.body={
                successful:false,
                message:"The password provided is the same as the old one"
            }
            next()
            return
        }
        let hashed_password = await check_and_hash(password)
        //ricerco l'utente ed inserisco la password hashata
        utente = await Utente.findByIdAndUpdate(req.body.loggedUser._id,{password:hashed_password}).exec()

        res.status(200)
        req.body={
            successful:true,
            message:"Password successfully changed!"
        }
        next()
        return
    } catch (error) {
        res.status(500)
        req.body={
            successful:false,
            message:"Server error in password change - failed!"
        }        
    }
}