import {Schema, model} from "mongoose"

export interface IDiario{
    pagine:String[],
    cliente:String
}

const schema= new Schema({
    pagine: [{type:String}],
    cliente: {type:String, required:true}
})

export const Diario = model<IDiario>('Diario', schema)
