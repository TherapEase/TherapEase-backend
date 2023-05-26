import { Schema, model } from "mongoose"

export interface IProdotto{
    nome:string;
    prezzo: number; //accetta anche numeri decimali
    n_gettoni: number
};

export const schema : Schema= new Schema({
    nome: {type: String, required: true},
    prezzo: {type: Number, required:true},
    n_gettoni: {type:Number, required:true}
});

export const Prodotto = model<IProdotto>('Prodotto', schema,"Prodotti");