import {Schema, model} from "mongoose"

// MODELLO PER TESTING senza ELEMENTI REQUIRED
export const Recensione= new Schema({
    voto: {type:Number},
    testo: {type:String, default:""},
    cliente: {type:String},
    data: {type:Date}
})

// MODELLO COMPLETO CON ELEMENTI REQUIRED
// export const Recensione= new Schema({
//     voto: {type:Number, required:true},
//     testo: {type:String, default:""},
//     cliente: {type:String, required:true},
//     data: {type:Date, required:true}
// })

module.exports= model("recensione", Recensione)