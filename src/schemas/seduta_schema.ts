import {Schema, model} from "mongoose"

export interface ISeduta{
    cliente?: String,
    terapeuta: String,
    abilitato: Boolean,
    data: Date, 
    indirizzo: String
}

const schema= new Schema({
    cliente: {type:String},
    terapeuta: {type:String, required:true},
    abilitato: {type:Boolean, default:false},
    data: {type:Date, required:true},
    indirizzo: {type:String, default:""}
})


export const Seduta= model<ISeduta>("Seduta", schema, "Sedute")
