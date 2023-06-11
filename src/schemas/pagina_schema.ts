import {Schema, model} from "mongoose"

export interface IPagina{
    data:Date,
    testo:String
    cliente:String
}

const schema= new Schema({
    data: {type:Date, required:true},
    testo: {type:String, required:true},
    cliente: {type:String, required:true}
})

export const Pagina = model<IPagina>('Pagina', schema, "Pagine")
