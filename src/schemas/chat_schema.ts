import { Schema, model } from "mongoose";

export class Messaggio{
    testo: String
    data: Date
    mittente: String
    letto:Boolean

    constructor(testo:String,data:Date,mittente:String){
        this.testo=testo
        this.data=data,
        this.mittente=mittente,
        this.letto=false
    }
}
export interface IChat{
    utente:String,
    supporto_tecnico:String,
    data_apertura:Date,
    risolta:Boolean,
    messaggi: Messaggio[]
}

export const Chat = model<IChat>('Chat',new Schema({
    utente: {type:String, required:true},
    supporto_tecnico: {type:String, required:true},
    data_apertura:{type:Date,required:true},
    risolta:{type:Boolean,default:false},
    messaggi:[{type:Schema.Types.Mixed}]
}),"Chat")