import {Schema, model} from 'mongoose'

export interface IInfo{
    testo: String,
    data: Date,
    foto: String,
    titolo: String
}

const schema= new Schema({
    testo: {type: String, required:true},
    data: {type:Date, required:true},
    foto: {type: String, default:""},
    titolo: {type: String, required:true}
})


export const Info = model<IInfo>('Info', schema,"Info")
