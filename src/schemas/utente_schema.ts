import { Hash } from "crypto"
import { Schema, model } from "mongoose"

interface Utente {
    username: String,
    password: String,
    ruolo: Number //essendo enum consideriamo l'intero
}

const schema = new Schema({
    username: { type: String, required: true },
    password: { type: String, required: true },
    ruolo: { type: Number, required: true }, //essendo enum consideriamo l'intero
})

export const Utente = model<Utente>('Utente', schema)
