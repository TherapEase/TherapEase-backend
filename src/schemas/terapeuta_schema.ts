import {Hash} from "crypto"
import {Schema, model} from "mongoose"


interface Terapeuta {
    username: String,
    password: Hash,
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
// MODELLO PER TESTING senza ELEMENTI REQUIRED
// const schema= new Schema({
//     username: {type: String},
//     password: {type: Hash},
//     ruolo : {type:Number}, //essendo enum consideriamo l'intero

//     nome:{type: String},
//     cognome:{type: String},
//     email:{type: String},
//     mail_confermata:{type:Boolean, default:false},
//     cf: {type:String},
//     foto_profilo: {type: Image, default:""},
//     data_nascita: {type:Date},

//     associati:[{type:String, default:""}],
//     abilitato:{type: Boolean, default: false},
//     limiteClienti: {type: Number, default: 30},
//     indirizzo: {type:String},
//     recensioni:[{type:String, default:""}]
// })


//MODELLO COMPLETO CON ELEMENTI REQUIRED
const schema= new Schema({
    username: {type: String, required:true},
    password: {type: Hash, required:true},
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

export const Terapeuta = model<Terapeuta>('Terapeuta', schema)
