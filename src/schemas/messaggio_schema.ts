import {Schema, model} from "mongoose"

interface Messaggio{
    testo: String,
    data: Date,
    mittente: String, //bisogna capire come gestire l'id ereditario
    destinatario: String,
    letto?:Boolean
}

// // MODELLO PER TESTING senza ELEMENTI REQUIRED
// export const schema= new Schema({
//     testo: {type:String},
//     data: {type:Date},
//     mittente:{type:String}, //bisogna capire come gestire l'id ereditario
//     destinatario: {type:String},
//     letto:{type:Boolean, default:false}
// })

//MODELLO COMPLETO CON ELEMENTI REQUIRED
const schema= new Schema({
    testo: {type:String, required:true},
    data: {type:Date, required:true},
    mittente: {type:String, required:true}, //bisogna capire come gestire l'id ereditario
    destinatario: {type:String, required:true},
    letto:{type:Boolean, default:false}
})

export const Messaggio = model<Messaggio>('Messaggio', schema, "Messaggi")