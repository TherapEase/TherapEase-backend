import {Hash} from "crypto"
import {Schema, model} from "mongoose"
import bcrypt from 'bcrypt'
import dotenv from 'dotenv'
import { check_and_hash } from "../controllers/password_hasher"


export interface ITerapeuta {
    username: String,
    password: String,
    ruolo : Number, //essendo enum consideriamo l'intero
    nome:String,
    cognome:String,
    email: String,
    mail_confermata?: Boolean,
    cf: String,
    foto_profilo?: String,
    data_nascita: Date,
    associati?:String[],
    abilitato?: Boolean,
    limite_clienti?: Number,
    indirizzo?: String,
    recensioni?:String[]
    documenti?:String[]
}
//MODELLO COMPLETO CON ELEMENTI REQUIRED
const schema= new Schema({
    username: {type: String, required:true},
    password: {type: String, required:true},
    ruolo : {type:Number, required:true}, //essendo enum consideriamo l'intero

    nome:{type: String, required:true},
    cognome:{type: String, required:true},
    email:{type: String, required:true},
    mail_confermata:{type:Boolean, default:false},
    cf: {type:String, required:true},
    foto_profilo: {type: String, default:""},
    data_nascita: {type:Date, required:true},

    associati:[{type:String, default:""}],
    abilitato:{type: Boolean, default: false},
    limite_clienti: {type: Number, default: 30},
    indirizzo: {type:String, required:false},
    recensioni:[{type:String, default:""}],
    documenti:[{type:String,required:true}]
})
schema.pre('save', async function(){
    if(this.isModified('password')){
        this.password= await check_and_hash(this.password)
    }
})

export const Terapeuta = model<ITerapeuta>('Terapeuta', schema,"Utenti")
