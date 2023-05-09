import {Schema, model} from "mongoose"

// MODELLO PER TESTING senza ELEMENTI REQUIRED
export const Seduta= new Schema({
    cliente: {type:String},
    terapeuta: {type:String},
    abilitato: {type:Boolean, default:false},
    data: {type:Date}
})

// MODELLO COMPLETO CON ELEMENTI REQUIRED
// export const Seduta= new Schema({
//     cliente: {type:String, required:false},
//     terapeuta: {type:String, required:true},
//     abilitato: {type:Boolean, default:false},
//     data: {type:Date, required:true}
// })


module.exports= model("seduta", Seduta)
