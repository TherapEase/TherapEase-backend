import {Hash} from "crypto"
import {Schema, model} from "mongoose"

// MODELLO PER TESTING senza ELEMENTI REQUIRED
const Terapeuta= new Schema({
    username: {type: String},
    password: {type: Hash},
    ruolo : {type:Number}, //essendo enum consideriamo l'intero

    nome:{type: String},
    cognome:{type: String},
    email:{type: String},
    mail_confermata:{type:Boolean, default:false},
    cf: {type:String},
    foto_profilo: {type: Image, default:""},
    data_nascita: {type:Date},

    associati:[{type:String, default:""}],
    abilitato:{type: Boolean, default: false},
    limiteClienti: {type: Number, default: 30},
    indirizzo: {type:String},
    recensioni:[{type:String, default:""}]
})

module.exports= model("terapeuti", Terapeuta)