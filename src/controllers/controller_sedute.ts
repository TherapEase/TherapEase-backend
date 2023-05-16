import { Request,Response,NextFunction } from 'express'
import {Cliente, ICliente} from '../schemas/cliente_schema'
import {Utente,IUtente} from '../schemas/utente_schema'
import { Terapeuta, ITerapeuta } from '../schemas/terapeuta_schema'
import { Seduta, ISeduta } from '../schemas/seduta_schema'

export async function crea_slot_seduta(req:Request,res:Response,next:NextFunction) {
    console.log(req.body.loggedUser)
    console.log(req.body.loggedUser.ruolo)
    //controllo accesso
    if(req.body.loggedUser.ruolo!=2){
        res.status(400)
        req.body={
            successful: false,
            message: "Permission denied"
        }
        return 
    }

    try{

    }catch(err){
        res.status(400)
        req.body={
            successful: false,
            message: "Creazione slot failed"
        }
        return 
    }

}