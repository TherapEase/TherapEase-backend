// import  {Utente} from '../classes/Utente'
// import {Utente_registrato} from '../classes/Utente_registrato'
// import {Cliente} from '../classes/Cliente'
// import {Terapeuta} from '../classes/Terapeuta'
import { Request,Response } from 'express'
import {Cliente} from '../schemas/cliente_schema'
import {Utente} from '../schemas/utente_schema'
import mongoose from 'mongoose'
import dotenv from 'dotenv'
import { Terapeuta } from '../schemas/terapeuta_schema'

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
   //const {username,password, ruolo,nome,cognome,email,cf,fp,dn,doc,lim,ind}=req.body
   const username=req.body.username
   const password=req.body.password
   const ruolo = req.body.ruolo
   const nome=req.body.nome
   const cognome=req.body.cognome
   const email=req.body.email
   const cf=req.body.codice_fiscale
   const fp=req.body.foto_profilo
   const dn=req.body.data_nascita
   const doc=req.body.documenti
   const lim=req.body.limite_clienti
   const ind=req.body.indirizzo
   console.log([username,password, ruolo,nome,cognome,email,cf,fp,dn,doc,lim,ind])
   if(!username||!password||!ruolo) return {status:400,succesfull:false,message:"Not enough arguments"}
   else if (ruolo<1||ruolo>2) return {status:400,succesfull:false,message:"Invalid Role"}

   try{
    await mongoose.connect(process.env.DB_CONNECTION_STRING)
    let utente_presente:boolean = false;    //check nel db
    if(!utente_presente){
        let utente_schema
        if(ruolo==1){
            //utente=new Cliente(username,password,ruolo,nome,cognome,email,false,cf,fp,dn,0,null,null)   //il costruttore dovrebbe occuparsi dei parametri di default
            utente_schema= new Cliente({
                username:username,
                password:password,
                ruolo:ruolo,
                nome:nome,
                cognome:cognome,
                email:email,
                codice_fiscale:cf,
                foto_profilo:fp,
                data_nascita:dn
            })
        }
        else if (ruolo==2){
            //utente = new Terapeuta(username,password,ruolo,nome,cognome,email,false,cf,fp,dn,[],false,doc,lim,ind,null)
            utente_schema= new Terapeuta({
                username:username,
                password:password,
                ruolo:ruolo,
                nome:nome,
                cognome:cognome,
                email:email,
                codice_fiscale:cf,
                foto_profilo:fp,
                data_nascita:dn,
                documenti:doc,
                limiteClienti: lim,
                indirizzo:ind
            })
        }
        await utente_schema.save();
        console.log("utente salvato")
        console.log(utente_schema)
        return {
            status:200,
            succesfull:true,
            message:"user saved correctly"
        }
    }
   }catch(err){
        console.log("errore"+err)
   }
   
}