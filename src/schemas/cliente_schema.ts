import {Schema, model} from 'mongoose'
import bcrypt from 'bcrypt'
import dotenv from 'dotenv'

// MODELLO PER TESTING senza ELEMENTI REQUIRED


const Cliente_schema=new Schema({
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

    n_gettoni:{type: Number, default:0},
    // per i tipi user definied si considera l'id che il db salva automaticamente
    associato:{type: String , default:""},
    diario:{type: String , default:""}
})
Cliente_schema.pre('save', async function(next){
    if(this.isModified('password'))
        this.password = await bcrypt.hash(this.password,parseInt(process.env.SALT_ROUNDS))
    next()
})

export const Cliente =  model("Cliente",Cliente_schema,"utente")




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

//module.exports= model("cliente", Cliente)
