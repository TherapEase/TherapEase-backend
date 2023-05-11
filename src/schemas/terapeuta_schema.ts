import {Hash} from "crypto"
import {Schema, model} from "mongoose"

// MODELLO PER TESTING senza ELEMENTI REQUIRED
export const Terapeuta= model("Terapeuta", new Schema({
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
}),"utente")


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