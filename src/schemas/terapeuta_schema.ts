import {Hash} from "crypto"
import {Schema, model} from "mongoose"
import bcrypt from 'bcrypt'
import dotenv from 'dotenv'

// MODELLO PER TESTING senza ELEMENTI REQUIRED

const Terapeuta_schema=new Schema({
    username: {type: String},
    password: {type: String},
    ruolo : {type:Number}, //essendo enum consideriamo l'intero

    nome:{type: String},
    cognome:{type: String},
    email:{type: String},
    mail_confermata:{type:Boolean, default:false},
    cf: {type:String},
    foto_profilo: {type: String, default:""},
    data_nascita: {type:Date},

    associati:[{type:String, default:""}],
    abilitato:{type: Boolean, default: false},
    limiteClienti: {type: Number, default: 30},
    indirizzo: {type:String},
    recensioni:[{type:String, default:""}]
})

Terapeuta_schema.pre('save', async function (next) {
    if(this.isModified('password')){
        if(!this.password.match("/^(?=.?[A-Z])(?=.?[a-z])(?=.?[0-9])(?=.?[#?!@$%^&*-]).{8,}$/gm")) throw new Error("Password doesn't match minimal requirements")
        this.password= await bcrypt.hash(this.password,parseInt(process.env.SALT_ROUNDS))
    }
})

export const Terapeuta= model("Terapeuta",Terapeuta_schema,"utente")


// MODELLO COMPLETO CON ELEMENTI REQUIRED
// const Terapeuta= new Schema({
//     username: {type: String, required:true},
//     password: {type: Hash, required:true},
//     ruolo : {type:Number, required:true}, //essendo enum consideriamo l'intero

//     nome:{type: String, required:true},
//     cognome:{type: String, required:true},
//     email:{type: String, required:true},
//     mail_confermata:{type:Boolean, default:false},
//     cf: {type:String, required:true},
//     foto_profilo: {type: Image, default:""},
//     data_nascita: {type:Date, required:true},

//     associati:[{type:String, default:""}],
//     abilitato:{type: Boolean, default: false},
//     limiteClienti: {type: Number, default: 30},
//     indirizzo: {type:String, required:false},
//     recensioni:[{type:String, default:""}]
// })

//module.exports= model("terapeuti", Terapeuta)