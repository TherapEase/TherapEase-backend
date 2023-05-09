// import  {Utente} from '../classes/Utente'
// import {Utente_registrato} from '../classes/Utente_registrato'
// import {Cliente} from '../classes/Cliente'
// import {Terapeuta} from '../classes/Terapeuta'
import { Request,Response } from 'express'
import {Cliente} from '../schemas/cliente_schema'
import {Utente} from '../schemas/utente_schema'
import connect from 'mongoose'
import mongoose from 'mongoose'
import dotenv from 'dotenv'

export async function registrazione(req:Request,res:Response) {
    /* STRUTTURA RICHIESTA: utente base
    *  username: string
    *  password :string
    *  ruolo: num
    *  nome: string
    *  cognome: string
    *  email: string
    *  codice_fiscale: string
    *  foto_profilo: Image
    *  data_nascita: Date
    *               SOLO PER IL TERAPEUTA
    *  documenti: string[]
    *  limite_clienti: num
    *  indirizzo:string
    */
   const {username,password, ruolo,nome,cognome,email,cf,fp,dn,doc,lim,ind}=req.body
   if(!username||!password||!ruolo) return res.status(400).json({successful:false,message:'campi mancanti'})
   else if (!(ruolo in [1,2])) return res.status(400).json({successful:false, message:'Ruolo non valido'})

   try{
    await mongoose.connect(process.env.DB_CONNECTION_STRING)
    let utente_presente:boolean = false;    //check nel db
    if(!utente_presente){
        //let utente:Utente_registrato
        if(ruolo==1){
            //utente=new Cliente(username,password,ruolo,nome,cognome,email,false,cf,fp,dn,0,null,null)   //il costruttore dovrebbe occuparsi dei parametri di default
            let utente_schema= new Utente({
                username:username,
                password:password,
                ruolo:ruolo
            })
            await utente_schema.save();
            console.log("utente salvato")
        }
        else if (ruolo==2){
            //utente = new Terapeuta(username,password,ruolo,nome,cognome,email,false,cf,fp,dn,[],false,doc,lim,ind,null)
        }
    }
   }catch(err){
        console.log("errore")
   }
   
}