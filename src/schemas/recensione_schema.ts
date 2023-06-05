import { Schema, model } from "mongoose"

export interface IRecensione {
    voto: Number,
    testo?: String,
    autore: String,
    data: Date
    recensito: String
}

const schema = new Schema({
    voto: { type: Number, required: true },
    testo: { type: String, default: "" },
    autore: { type: String, required: true },
    data: { type: Date, required: true },
    recensito: { type: String, required: true },
})

export const Recensione = model<IRecensione>('Recensione', schema)