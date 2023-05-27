import { Schema, model } from "mongoose"

export interface ISegnalazione {
    segnalato: String
    testo: String,
    data: Date
}

const schema = new Schema({
    segnalato: { type: String, required: true, default: ""},
    testo: { type: String, required: true, default: "" },
    data: { type: Date, required: true },
})

export const Segnalazione = model<ISegnalazione>('Segnalazione', schema)