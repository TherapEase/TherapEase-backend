import {Schema, model} from 'mongoose'
import bcrypt from 'bcrypt'
import dotenv from 'dotenv'

export interface ICliente{
	username:  String,
    password: String,
    ruolo : Number, //essendo enum consideriamo l'intero
    nome:String,
    cognome:String,
    email:String,
    mail_confermata?:Boolean,
    cf: String,
    foto_profilo?:String,
    data_nascita: Date,
    n_gettoni?:Number,
    associato?:String,
    diario?:String

}

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
        n_gettoni:{type: Number, default:0},
        // per i tipi user definied si considera l'id che il db salva automaticamente
        associato:{type: String , default:""},
        diario:{type: String , default:""}
    })
schema.pre('save', async function(next){
    if(this.isModified('password')){
        if(this.password.match("/^(?=.?[A-Z])(?=.?[a-z])(?=.?[0-9])(?=.?[#?!@$%^&*-]).{8,}$/gm")) throw new Error("Password doesn't match minimal requirements")
        this.password = await bcrypt.hash(this.password,parseInt(process.env.SALT_ROUNDS))
    }
    next()
})

export const Cliente = model<ICliente>('Cliente', schema,"Utenti")
