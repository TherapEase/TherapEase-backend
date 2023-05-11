import { Hash } from "crypto"
import { Schema, model } from "mongoose"
import bcrypt from 'bcrypt'

interface Utente {
    username: String,
    password: String,
    ruolo: Number //essendo enum consideriamo l'intero
};

export const schema : Schema= new Schema({
    username: { type: String, required: true },
    password: { type: String, required: true },
    ruolo: { type: Number, required: true }, //essendo enum consideriamo l'intero
});

schema.methods.checkPassword = async function(password:string) {
    const match= bcrypt.compare(password, this.password)
    return match
};

export const Utente = model<Utente>('Utente', schema,"utente");