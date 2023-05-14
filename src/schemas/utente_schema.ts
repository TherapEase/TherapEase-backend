import { Hash } from "crypto"
import { Schema, model } from "mongoose"
import bcrypt from 'bcrypt'

export interface IUtente {
    username: String,
    password: String,
    ruolo: Number,
    checkPassword(password:String): boolean
};

export const schema : Schema= new Schema({
    username: { type: String, required: true },
    password: { type: String, required: true },
    ruolo: { type: Number, required: true }, //essendo enum consideriamo l'intero
});

schema.methods.checkPassword = async function(password:string) {
    const match = await bcrypt.compare(password, this.password)
    return match
};

export const Utente = model<IUtente>('Utente', schema,"Utenti");
