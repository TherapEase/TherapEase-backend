import {Schema, model} from "mongoose"

// MODELLO PER TESTING senza ELEMENTI REQUIRED
export const Messaggio= new Schema({
    testo: {type:String},
    data: {type:Date},
    mittente: {type:String}, //bisogna capire come gestire l'id ereditario
    destinatario: {type:String},
    letto:{type:Boolean, default:false}
})

// MODELLO COMPLETO CON ELEMENTI REQUIRED
// export const Messaggio= new Schema({
//     testo: {type:String, required:true},
//     data: {type:Date, required:true},
//     mittente: {type:String, required:true}, //bisogna capire come gestire l'id ereditario
//     destinatario: {type:String, required:true},
//     letto:{type:Boolean, default:false}
// })

module.exports= model("messaggio", Messaggio)