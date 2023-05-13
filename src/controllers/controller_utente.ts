import { Request,Response,NextFunction } from 'express'
import {Cliente} from '../schemas/cliente_schema'
import {schema, Utente,IUtente} from '../schemas/utente_schema'
import connect from 'mongoose'
import mongoose from 'mongoose'
import dotenv from 'dotenv'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcrypt';
import { parse } from 'path'
//import { Utente } from '../classes/Utente'


export async function login(req:Request,res:Response,next:NextFunction) {
    const username=req.body.username
    const password=req.body.password

    // controllo su campi mancanti
    if (!username || !password){
        res.status(400)
        req.body={
            successful: false,
            message: "Not enough arguments"
        }
    } 

    try {
        // recupero utente dal database
        await mongoose.connect(process.env.DB_CONNECTION_STRING)
        const utente_trovato = await Utente.findOne({username: username}).exec()

        // se non esiste, ritorno un errore
        if (!utente_trovato){
            res.status(400)
            req.body={
                successful: false,
                message: "User not found"
            }
        };

        // controllo la password
        const modello_utente = new Utente<IUtente>(utente_trovato)
        const passwordCorretta= await modello_utente.checkPassword(password)

        if (!passwordCorretta){
                res.status(400)
                req.body={
                    successfull:false,
                    message:"incorrect password"
                }
        };
    
        //creo il token aggiungendo i vari campi utili
        
        const token = jwt.sign({
            _id: utente_trovato._id.toString(),
            username: utente_trovato.username
        },process.env.TOKEN_SECRET,{expiresIn: '50 years'})
    
        // res.status(200).json({ success: true, token: token })
        res.status(200)
        req.body={
            successfull:true,
            message:"authenticated",
            token: token 
        }
    
    } catch (err) {
        res.status(500)
        req.body={
            successfull:false,
            message:"Internal Error: auth failed"+err
        }
    }
    next()
}

