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


export async function prenota_seduta(req:Request,res:Response,next:NextFunction) {
    //controllo accesso, solo cliente
    if(req.body.loggedUser.ruolo!=1){
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


    //nessun terapeuta associato
    await mongoose.connect(process.env.DB_CONNECTION_STRING)
    let cliente = await Cliente.findById(req.body.loggedUser._id).exec()
    if(cliente.associato==""){
        res.status(400)
        req.body={
            successful: false,
            message: "No therapist associated!"
        }
        next()
        return
    }
    try{
        let seduta = await Seduta.findOneAndUpdate({terapeuta:cliente.associato, data:data, cliente:""},{cliente:req.body.loggedUser._id},{new:true})
        if(!seduta){
            res.status(400)
            req.body={
                successful: false,
                message: "Seduta requested not available"
            }
            next()
            return
        }else{
            res.status(200)
            req.body={
                successful: true,
                message: "Seduta booked!"
            }
            next()
            return
        }
    }catch(err){
        res.status(400)
        req.body={
            successful: false,
            message: "Booking failed"
        }
        next()
        return
    }
}

export async function remove_prenotazioni_if_disassociato(id_cliente:string, id_terapeuta:String) {
    await mongoose.connect(process.env.DB_CONNECTION_STRING)
    let sedute_modificate=await Seduta.updateMany({cliente:id_cliente, terapeuta:id_terapeuta, abilitato:true},{cliente:""}).exec()
    // TO-DO aggiungi al cliente id_cliente un numero di gettoni pari a sedute_modificate.modifiedCount
    await Seduta.updateMany({cliente:id_cliente, terapeuta:id_terapeuta},{cliente:""}).exec()
}

export async function annulla_prenotazione_seduta(req:Request,res:Response,next:NextFunction) {
    //controllo accesso, solo cliente
    if(req.body.loggedUser.ruolo!=1){
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
        // posso farlo perchè se tolgo l'associazione elimino automaticamente tutte le prenotazioni
        let seduta= await Seduta.findOneAndUpdate({data:data, cliente:req.body.loggedUser._id}, {cliente:""}).exec()
        if(!seduta){
            res.status(400)
            req.body={
                successful: false,
                message: "Seduta not present"
            }
            next()
            return
        }else{
            if(seduta.abilitato==true){
                // TO -DO riaccredito gettone al cliente
            }

            res.status(200)
            req.body={
                successful: true,
                message: "Booking deleted!"
            }
            next()
            return
        }
    }catch(err){
        res.status(400)
        req.body={
            successful: false,
            message: "Booking removal failed"
        }
        next()
        return
    }

}

export async function mostra_calendario_completo(req:Request, res:Response,next:NextFunction){
    try{
        await mongoose.connect(process.env.DB_CONNECTION_STRING)
        if(req.body.loggedUser.ruolo==1){
            res.status(200)
            req.body={
                successful: true,
                sedute: await Seduta.find({cliente:req.body.loggedUser._id}).exec(),
                message: "OK"
            }
            next()
            return
        }
        if(req.body.loggedUser.ruolo==2){
            res.status(200)
            req.body={
                successful: true,
                sedute: await Seduta.find({terapeuta:req.body.loggedUser._id}).exec(),
                message: "OK"
            }
            next()
            return
        }
    }catch(err){
        res.status(400)
        req.body={
            successful: false,
            message: "Show calendar failed"
        }
        next()
        return
    }

}

export async function mostra_calendario_disponibili(req:Request, res:Response,next:NextFunction){
    try{
        await mongoose.connect(process.env.DB_CONNECTION_STRING)
        if(req.body.loggedUser.ruolo==1){
            let cliente=await Cliente.findById(req.body.loggedUser._id).exec()

            res.status(200)
            req.body={
                successful: true,
                sedute: await Seduta.find({cliente:"", terapeuta:cliente.associato}).exec(),
                message: "OK"
            }
            next()
            return
        }
        if(req.body.loggedUser.ruolo==2){
            res.status(200)
            req.body={
                successful: true,
                sedute: await Seduta.find({terapeuta:req.body.loggedUser._id, cliente:""}).exec(),
                message: "OK"
            }
            next()
            return
        }
    }catch(err){
        res.status(400)
        req.body={
            successful: false,
            message: "Show calendar failed"
        }
        next()
        return
    }

}

export async function mostra_calendario_prenotate(req:Request, res:Response,next:NextFunction){
    try{
        await mongoose.connect(process.env.DB_CONNECTION_STRING)
        if(req.body.loggedUser.ruolo==1){
            res.status(200)
            req.body={
                successful: true,
                sedute: await Seduta.find({cliente:req.body.loggedUser._id}).exec(),
                message: "OK"
            }
            next()
            return
        }
        if(req.body.loggedUser.ruolo==2){
            res.status(200)
            req.body={
                successful: true,
                sedute: await Seduta.find({terapeuta:req.body.loggedUser._id, cliente:{$ne:""}}).exec(),
                message: "OK"
            }
            next()
            return
        }
    }catch(err){
        res.status(400)
        req.body={
            successful: false,
            message: "Show calendar failed" + err
        }
        next()
        return
    }

}