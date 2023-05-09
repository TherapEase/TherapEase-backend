import {Hash} from "crypto"
import {Schema, model} from "mongoose"

// MODELLO PER TESTING senza ELEMENTI REQUIRED
export const Cliente= new Schema({
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

    n_gettoni:{type: Number, default:0},
    // per i tipi user definied si considera l'id che il db salva automaticamente
    associato:{type: String , default:""},
    diario:{type: String , default:""}
})



// MODELLO COMPLETO CON ELEMENTI REQUIRED
// export const Cliente= new Schema({
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

//     n_gettoni:{type: Number, default:0},
//     // per i tipi user definied si considera l'id che il db salva automaticamente
//     associato:{type: String , default:""},
//     diario:{type: String , default:""}
// })

module.exports= model("cliente", Cliente)
