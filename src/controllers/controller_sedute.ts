import { Request,Response,NextFunction } from 'express'
import {Cliente, ICliente} from '../schemas/cliente_schema'
import {Utente,IUtente} from '../schemas/utente_schema'
import { Terapeuta, ITerapeuta } from '../schemas/terapeuta_schema'
import { Seduta, ISeduta } from '../schemas/seduta_schema'
import mongoose from 'mongoose'
import { isNull } from 'util'

export async function crea_slot_seduta(req:Request,res:Response,next:NextFunction) {
    //controllo accesso, solo terapeuta
    if(req.body.loggedUser.ruolo!=2){
        res.status(400)
        req.body={
            successful: false,
            message: "Permission denied"
        }
        next()
        return 
    }

    // controllo presenza campi
    //DATA format:2024-11-02T04:20:00.000Z
    const data=req.body.data
    if(!data){
        res.status(400)
        req.body={
            successful: false,
            message: "Not enough arguments"
        }
        next()
        return
    }

    try{
        await mongoose.connect(process.env.DB_CONNECTION_STRING)
        //controllo che non sia già presente
        let seduta_presente = await Seduta.findOne({data:data, terapeuta:req.body.loggedUser._id}).exec()
        console.log(seduta_presente)
        if(!seduta_presente){  // come si fa check null?
            //inserisco
            const seduta_schema= new Seduta<ISeduta>({
                cliente: "",
                terapeuta: req.body.loggedUser._id,
                abilitato: true,
                data: data
            })
            await seduta_schema.save();
            res.status(200)
            req.body={
                successful: true,
                message: "Slot created"
            }
            next()
            return 
        }else{
            res.status(400)
            req.body={
                successful: false,
                message: "Slot already present"
            }
            next()
            return 
        }
    }catch(err){
        res.status(400)
        req.body={
            successful: false,
            message: "Creazione slot failed"
        }
        next()
        return 
    }

}


export async function elimina_slot_seduta(req:Request,res:Response,next:NextFunction) {
    //controllo accesso, solo terapeuta
    if(req.body.loggedUser.ruolo!=2){
        res.status(400)
        req.body={
            successful: false,
            message: "Permission denied"
        }
        next()
        return 
    }

    // controllo presenza campi
    //DATA format:2024-11-02T04:20:00.000Z
    const data=req.body.data
    if(!data){
        res.status(400)
        req.body={
            successful: false,
            message: "Not enough arguments"
        }
        next()
        return
    }

    try{
        await mongoose.connect(process.env.DB_CONNECTION_STRING)
        let seduta_presente = await Seduta.findOneAndDelete({data:data, terapeuta:req.body.loggedUser._id, abilitato:true}).exec()
        if(!seduta_presente){  
            res.status(400)
            req.body={
                successful: false,
                message: "Slot doesn't exist or can't be removed"
            }
            next()
            return 
        }else{
            if(seduta_presente.cliente!=""){
                // TO - DO : gestione gettoni aumento di un gettone per annullamento seduta
                // TO - DO : mail di annullamento seduta
                console.log("+1 GETTONI CLIENTE PRENOTATO")
                console.log("MAIL ANNULLAMENTO SEDUTA")
            }
            res.status(200)
            req.body={
                successful: true,
                message: "Slot deleted!"
            }
            next()
            return 
        }
    }catch(err){
        res.status(400)
        req.body={
            successful: false,
            message: "Delete slot failed"
        }
        next()
        return 
    }

}