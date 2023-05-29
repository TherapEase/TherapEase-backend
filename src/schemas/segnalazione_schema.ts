import { Schema, model } from "mongoose"

export interface ISegnalazione {
    segnalato: String
    testo: String,
    data: Date
    gestita: Boolean
}

const schema = new Schema({
    segnalato: { type: String, required: true, default: ""},
    testo: { type: String, required: true, default: "" },
    data: { type: Date, required: true },
    gestita: { type: Boolean, required: true, default:false},
})

export const Segnalazione = model<ISegnalazione>('Segnalazione', schema)