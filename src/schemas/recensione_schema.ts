import { Schema, model } from "mongoose"

interface Recensione {
    voto: Number,
    testo?: String,
    cliente: String,
    data: Date
}

const schema = new Schema({
    voto: { type: Number, required: true },
    testo: { type: String, default: "" },
    cliente: { type: String, required: true },
    data: { type: Date, required: true }
})

export const Recensione = model<Recensione>('Recensione', schema)