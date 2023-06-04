import {Schema, model} from 'mongoose'

export interface IInfo{
    testo: String,
    data: Date,
    foto: String
}

const schema= new Schema({
    Test: {type: String, required:true},
    data: {type:Date, required:true},
    foto: {type: String, default:""},
})


export const Info = model<IInfo>('Info', schema,"Info")
