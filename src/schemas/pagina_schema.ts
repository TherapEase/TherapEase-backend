import {Schema, model} from "mongoose"

interface Pagina{
    data:Date,
    testo:String
}

const schema= new Schema({
    data: {type:Date, required:true},
    testo: {type:String, required:true}
})

export const Pagina = model<Pagina>('Pagina', schema)
