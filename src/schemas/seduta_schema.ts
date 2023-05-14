import {Schema, model} from "mongoose"

interface Seduta{
    cliente?: String,
    terapeuta: String,
    abilitato: Boolean,
    data: Date
}

const schema= new Schema({
    cliente: {type:String},
    terapeuta: {type:String, required:true},
    abilitato: {type:Boolean, default:false},
    data: {type:Date, required:true}
})


export const Seduta= model<Seduta>("Seduta", schema)
