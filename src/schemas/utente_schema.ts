import {Hash} from "crypto"
import {Schema, model} from "mongoose"

// MODELLO PER TESTING senza ELEMENTI REQUIRED
export const Utente= model('Utente', new Schema({
        username: {type: String},
        password: {type: String},
        ruolo : {type:Number}, //essendo enum consideriamo l'intero
    }),"utente")


// MODELLO COMPLETO CON ELEMENTI REQUIRED
// const Utente= new Schema({
//     username: {type: String, required:true},
//     password: {type: String, required:true},
//     ruolo : {type:Number, required:true}, //essendo enum consideriamo l'intero
// })

//module.exports= model("utente", Utente)