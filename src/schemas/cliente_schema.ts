import {Hash} from "crypto"
import {Schema, model} from 'mongoose'


interface Cliente{
	username:  String,
    password: Hash,
    ruolo : Number, //essendo enum consideriamo l'intero
    nome:String,
    cognome:String,
    email:String,
    mail_confermata?:Boolean,
    cf: String,
    foto_profilo?:ImageData,
    data_nascita: Date,
    n_gettoni?:Number,
    associato?:String,
    diario?:String

}

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
        n_gettoni:{type: Number, default:0},
        // per i tipi user definied si considera l'id che il db salva automaticamente
        associato:{type: String , default:""},
        diario:{type: String , default:""}
    })


export const Cliente = model<Cliente>('Cliente', schema)