import { Request,Response } from 'express'
import {Cliente} from '../schemas/cliente_schema'
import {schema, Utente} from '../schemas/utente_schema'
import connect from 'mongoose'
import mongoose from 'mongoose'
import dotenv from 'dotenv'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcrypt';
//import { Utente } from '../classes/Utente'


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
        await mongoose.connect(process.env.DB_CONNECTION_STRING)
        const utente_trovato = await Utente.findOne({username: username}).exec()
        
        /*******************PROBLEMA****************************************
         *  findOne ritorna una Promise, che va risolta con exec 
         *  viene tornato un Document, superclasse di Model
         *  non è possibile accedere ai metodi neanche castando in quanto viene
         *  creato un oggetto Document, non un Utente poi usato come Document
         * 
         *  ho provato ad usare le callback, non è più possibile inserirle in findOne o in exec()
         *  si potrebbe provare il chaining usanto .then()
         * 
         *  l'alternativa è rinunciare ad includere i metodi che usano risultati delle query
         *  negli schemi e crearli esterni
         */

        // se non esiste, ritorno un errore
        if (!utente_trovato)return{
            status: 400,
            successful: false,
            message: "User not found"
        } 
        
        const passwordCorretta=password==utente_trovato.password        //soluzione temporanea
        console.log(utente_trovato)
        // controllo la password
        //const passwordCorretta = await utente.checkPassword(password)
        //console.log(utente.password)
            if (!passwordCorretta)
                return {
                    status:400,
                    successfull:false,
                    message:"incorrect password"
                }
    
            // se tutto va bene, creo il token aggiungendo i vari campi utili
   
    
            // res.status(200).json({ success: true, token: token })
            return {
                status:200,
                successfull:true,
                message:"authenticated"
            }
    
        } catch (err) {
            return {
                status:500,
                successfull:false,
                message:"Internal Error: auth failed"+err
            }
        }
}

