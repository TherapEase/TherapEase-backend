import {Schema, model} from "mongoose"

interface Messaggio{
    testo: String,
    data: Date,
    mittente: String, 
    destinatario: String,
    letto?:Boolean
}

const schema= new Schema({
    testo: {type:String, required:true},
    data: {type:Date, required:true},
    mittente: {type:String, required:true}, 
    destinatario: {type:String, required:true},
    letto:{type:Boolean, default:false}
})

export const Messaggio = model<Messaggio>('Messaggio', schema, "Messaggi")