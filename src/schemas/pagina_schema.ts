import {Schema, model} from "mongoose"

// MODELLO PER TESTING senza ELEMENTI REQUIRED
export const Pagina= new Schema({
    data: {type:Date},
    testo: {type:String}
})

// MODELLO COMPLETO CON ELEMENTI REQUIRED
// export const Pagina= new Schema({
//     data: {type:Date, required:true},
//     testo: {type:String, required:true}
// })

module.exports= model("pagina", Pagina)