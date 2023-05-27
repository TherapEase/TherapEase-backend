import { Request,Response,NextFunction } from 'express'
import {Cliente, ICliente} from '../schemas/cliente_schema'
import {Utente,IUtente} from '../schemas/utente_schema'
import { Terapeuta, ITerapeuta } from '../schemas/terapeuta_schema'
import { Seduta, ISeduta } from '../schemas/seduta_schema'
import mongoose from 'mongoose'
import scheduler from 'node-schedule'
import { send_mail } from './gmail_connector'
import { aggiungi_gettoni } from './controller_prodotti'

export async function crea_slot_seduta(req:Request,res:Response,next:NextFunction) {
    //controllo accesso, solo terapeuta
    if(req.body.loggedUser.ruolo!=2){
        res.status(403)
        req.body={
            successful: false,
            message: "Request denied!"
        }
        next()
        return 
    }

    // controllo presenza campi
    //DATA format:2024-11-02T04:20:00.000Z
    const data=req.body.data
    const presenza= req.body.presenza
    if(!data || !presenza){
        res.status(400)
        req.body={
            successful: false,
            message: "Not enough arguments!"
        }
        next()
        return
    }
    else if(data<=Date.now()){
        res.status(400)
        req.body={
            successful:false,
            message:"Cannot create a seduta in the past!"
        }
        next()
        return 
    }
    try{
        await mongoose.connect(process.env.DB_CONNECTION_STRING)
        //controllo che non sia già presente
        let seduta_presente = await Seduta.findOne({data:data, terapeuta:req.body.loggedUser._id}).exec()
        console.log(seduta_presente)
        if(!seduta_presente){  
            let seduta_schema
            if(presenza==true){
                let terapeuta= await Terapeuta.findById(req.body.loggedUser._id).exec()
                //inserisco
                seduta_schema= new Seduta<ISeduta>({
                    cliente: "",
                    terapeuta: req.body.loggedUser._id,
                    abilitato: true,
                    data: data, 
                    indirizzo: terapeuta.indirizzo
                })
            }else{
                //inserisco
                seduta_schema= new Seduta<ISeduta>({
                    cliente: "",
                    terapeuta: req.body.loggedUser._id,
                    abilitato: true,
                    data: data,
                    indirizzo:""
                })
            }
            await seduta_schema.save();

            res.status(200)
            req.body={
                successful: true,
                message: "Slot successfully created!"
            }
            next()
            return 
        }else{
            res.status(409)
            req.body={
                successful: false,
                message: "Slot already present!"
            }
            next()
            return 
        }
    }catch(err){
        res.status(500)
        req.body={
            successful: false,
            message: "Server error in slot creation - failed!"
        }
        next()
        return 
    }

}


export async function elimina_slot_seduta(req:Request,res:Response,next:NextFunction) {
    //controllo accesso, solo terapeuta
    if(req.body.loggedUser.ruolo!=2){
        res.status(403)
        req.body={
            successful: false,
            message: "Request denied!"
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
            message: "Not enough arguments!"
        }
        next()
        return
    }

    try{
        await mongoose.connect(process.env.DB_CONNECTION_STRING)
        let seduta_presente = await Seduta.findOneAndDelete({data:data, terapeuta:req.body.loggedUser._id, abilitato:true}).exec()
        if(!seduta_presente){  
            res.status(409)
            req.body={
                successful: false,
                message: "Element doesn’t exist or can’t be removed!"
            }
            next()
            return 
        }else{
            if(seduta_presente.cliente!=""){
                let cliente = await Cliente.findById(seduta_presente.cliente).exec()
                aggiungi_gettoni(seduta_presente.cliente as string,1)
                send_mail("Annullamento Prenotazione","La sua prenotazione è stata annullata",cliente.email.toString())
            }
            res.status(200)
            req.body={
                successful: true,
                message: "Slot successfully deleted!"
            }
            next()
            return 
        }
    }catch(err){
        res.status(500)
        req.body={
            successful: false,
            message: "Server error in slot removal - failed!"
        }
        next()
        return 
    }

}


export async function prenota_seduta(req:Request,res:Response,next:NextFunction) {
    //controllo accesso, solo cliente
    if(req.body.loggedUser.ruolo!=1){
        res.status(403)
        req.body={
            successful: false,
            message: "Request denied!"
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
            message: "Not enough arguments!"
        }
        next()
        return
    }


    //nessun terapeuta associato
    await mongoose.connect(process.env.DB_CONNECTION_STRING)
    let cliente = await Cliente.findById(req.body.loggedUser._id).exec()
    if(cliente.associato==""){
        res.status(409)
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
            res.status(409)
            req.body={
                successful: false,
                message: "Element doesn’t exist or can’t be booked or unbooked!"
            }
            next()
            return
        }else{
            // email conferma prenotazione
            let promemoria_prenotazione = new Date(seduta.data)
            promemoria_prenotazione.setDate(promemoria_prenotazione.getDate()-1)
            console.log("data seduta: "+seduta.data + "prenotazione "+promemoria_prenotazione)
            const job = scheduler.scheduleJob(promemoria_prenotazione,async function(seduta:ISeduta) {
                //mail di promemoria
                send_mail("Promemoria Prenotazione","Le ricordiamo la sua prenotazione in data: "+seduta.data,cliente.email.toString())
                //set annullabile a false
                await Seduta.findOneAndUpdate({data:seduta.data,terapeuta:seduta.terapeuta},{abilitato:false}).exec()
            }.bind(null,seduta))

            // togli gettone
            aggiungi_gettoni(req.body.loggedUser._id, -1)

            res.status(200)
            req.body={
                successful: true,
                message: "Booking successful!"
            }
            next()
            return
        }
    }catch(err){
        res.status(500)
        req.body={
            successful: false,
            message: "Server error in booking - failed!"
        }
        next()
        return
    }
}

export async function remove_prenotazioni_if_disassociato(id_cliente:string, id_terapeuta:String) {
    await mongoose.connect(process.env.DB_CONNECTION_STRING)
    let sedute_modificate=await Seduta.updateMany({cliente:id_cliente, terapeuta:id_terapeuta, abilitato:true},{cliente:""}).exec()
    // riaccredita gettoni pari al numero di sedute annullate, ancora annullabili
    aggiungi_gettoni(id_cliente, sedute_modificate.modifiedCount)
    await Seduta.updateMany({cliente:id_cliente, terapeuta:id_terapeuta},{cliente:""}).exec()
}

export async function annulla_prenotazione_seduta(req:Request,res:Response,next:NextFunction) {
    //controllo accesso, solo cliente
    if(req.body.loggedUser.ruolo!=1){
        res.status(403)
        req.body={
            successful: false,
            message: "Request denied!"
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
            message: "Not enough arguments!"
        }
        next()
        return
    }

    try{
        await mongoose.connect(process.env.DB_CONNECTION_STRING)
        // posso farlo perchè se tolgo l'associazione elimino automaticamente tutte le prenotazioni
        let seduta= await Seduta.findOneAndUpdate({data:data, cliente:req.body.loggedUser._id}, {cliente:""}).exec()
        if(!seduta){
            res.status(409)
            req.body={
                successful: false,
                message: "Element doesn’t exist or can’t be booked or unbooked!"
            }
            next()
            return
        }else{
            if(seduta.abilitato==true){
                // riaccredita gettoni al cliente
                aggiungi_gettoni(req.body.loggedUser._id, 1)
            }
            // email di conferma annullamento
            let cliente = await Cliente.findById(seduta.cliente).exec() 
            send_mail("Annullamento Prenotazione","La sua prenotazione è stata annullata",cliente.email.toString())

            res.status(200)
            req.body={
                successful: true,
                message: "Booking deleted!"
            }
            next()
            return
        }
    }catch(err){
        res.status(500)
        req.body={
            successful: false,
            message: "Server error in deleting booked seat - failed!"
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
                message: "Client calendar successfully shown!"
            }
            next()
            return
        }
        if(req.body.loggedUser.ruolo==2){
            res.status(200)
            req.body={
                successful: true,
                sedute: await Seduta.find({terapeuta:req.body.loggedUser._id}).exec(),
                message: "Therapist calendar successfully shown!"
            }
            next()
            return
        }
    }catch(err){
        res.status(500)
        req.body={
            successful: false,
            message: "Server error in calendar showing- failed!"
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
                message: "Client calendar successfully shown!"
            }
            next()
            return
        }
        if(req.body.loggedUser.ruolo==2){
            res.status(200)
            req.body={
                successful: true,
                sedute: await Seduta.find({terapeuta:req.body.loggedUser._id, cliente:""}).exec(),
                message: "Therapist calendar successfully shown!"
            }
            next()
            return
        }
    }catch(err){
        res.status(500)
        req.body={
            successful: false,
            message: "Server error in calendar showing- failed!"
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
                message: "Client calendar successfully shown!"
            }
            next()
            return
        }
        if(req.body.loggedUser.ruolo==2){
            res.status(200)
            req.body={
                successful: true,
                sedute: await Seduta.find({terapeuta:req.body.loggedUser._id, cliente:{$ne:""}}).exec(),
                message: "Therapist calendar successfully shown!"
            }
            next()
            return
        }
    }catch(err){
        res.status(500)
        req.body={
            successful: false,
            message: "Server error in calendar showing- failed!"
        }
        next()
        return
    }

}