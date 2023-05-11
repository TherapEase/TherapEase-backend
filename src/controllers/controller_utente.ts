import { Request,Response } from 'express'
import {Cliente} from '../schemas/cliente_schema'
import {schema, Utente} from '../schemas/utente_schema'
import connect from 'mongoose'
import mongoose from 'mongoose'
import dotenv from 'dotenv'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcrypt';


export async function login(req:Request,res:Response) {
    const username=req.body.username
    const password=req.body.password

    // controllo su campi mancanti
    if (!username || !password) return{
        status: 400,
        successful: false,
        message: "Not enough arguments"
    } 

    try {
        // recupero utente dal database
        const utente = await Utente.findOne({username: username})
    
        // se non esiste, ritorno un errore
        if (!utente)return{
            status: 400,
            successful: false,
            message: "User not found"
        } 
    
        // controllo la password
        const passwordCorretta = await utente.checkPassword(password)
    
            if (!passwordCorretta)
                return res.status(400).json({ success: false, message: "Password incorretta" })
    
            // se tutto va bene, creo il token aggiungendo i vari campi utili
   
    
            // res.status(200).json({ success: true, token: token })
    
        } catch (err) {
            res.status(500).json({ success: false, error: "autenticazione fallita" })
        }
}

