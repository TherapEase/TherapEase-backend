import {Hash} from "crypto"
import {Schema, model} from "mongoose"
import bcrypt from 'bcrypt'
import dotenv from 'dotenv'


interface Terapeuta {
    username: String,
    password: String,
    ruolo : Number, //essendo enum consideriamo l'intero
    nome:String,
    cognome:String,
    email: String,
    mail_confermata?: Boolean,
    cf: String,
    foto_profilo?: ImageData,
    data_nascita: Date,
    associati?:String[],
    abilitato?: Boolean,
    limiteClienti?: Number,
    indirizzo?: String,
    recensioni?:String[]
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
    foto_profilo: {type: Image, default:""},
    data_nascita: {type:Date, required:true},

    associati:[{type:String, default:""}],
    abilitato:{type: Boolean, default: false},
    limiteClienti: {type: Number, default: 30},
    indirizzo: {type:String, required:false},
    recensioni:[{type:String, default:""}]
})
schema.pre('save', async function (next) {
    if(this.isModified('password')){
        if(!this.password.match("/^(?=.?[A-Z])(?=.?[a-z])(?=.?[0-9])(?=.?[#?!@$%^&*-]).{8,}$/gm")) throw new Error("Password doesn't match minimal requirements")
        this.password= await bcrypt.hash(this.password,parseInt(process.env.SALT_ROUNDS))
    }
})

export const Terapeuta = model<Terapeuta>('Terapeuta', schema)
