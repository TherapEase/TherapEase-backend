import {Schema, model} from 'mongoose'

export interface ISessione{
    n_gettoni: number,
    id_cliente: string
}

const schema= new Schema({
        n_gettoni: {type: Number, required: true},
        id_cliente: {type:String, required: true}
})

export const Sessione = model<ISessione>('Sessione', schema,"Sessioni")
