import { Request,Response } from 'express'
import { Cliente } from '../schemas/cliente_schema'
import { Terapeuta } from '../schemas/terapeuta_schema'
import { Seduta, ISeduta } from '../schemas/seduta_schema'
import scheduler from 'node-schedule'
import { send_mail } from '../services/gmail_connector'
import { aggiungi_gettoni } from './controller_prodotti'

export async function crea_slot_seduta(req:Request,res:Response) {
    //controllo accesso, solo terapeuta
    if(req.body.loggedUser.ruolo!=2){
        res.status(403).json({
            successful: false,
            message: "Request denied!"
        })
        return
    }

    // controllo presenza campi
    const data=req.body.data
    const presenza= req.body.presenza
    if(!data){
        res.status(400).json({
            successful: false,
            message: "Not enough arguments!"
        })
        return
    }
    else if((new Date(data).getTime()<=Date.now())==true){
        res.status(400).json({
            successful:false,
            message:"Cannot create a seduta in the past!"
        })
        return
    }


    try{
        //controllo che non sia già presente
        let seduta_presente = await Seduta.findOne({data:data, terapeuta:req.body.loggedUser._id}).exec()
        console.log(seduta_presente)
        if(!seduta_presente){
            let terapeuta= await Terapeuta.findById(req.body.loggedUser._id).exec()
            //inserisco
            let seduta_schema= new Seduta<ISeduta>({
                cliente: "",
                terapeuta: req.body.loggedUser._id,
                abilitato: true,
                data: data, 
                indirizzo: presenza?terapeuta.indirizzo:""
            })
            
            await Seduta.create(seduta_schema)

            res.status(200).json({
                successful: true,
                message: "Slot successfully created!"
            })
            return
        }else{
            res.status(409).json({
                successful: false,
                message: "Slot already present!"
            })
            return
        }
    }catch(err){
        res.status(500).json({
            successful: false,
            message: "Server error in slot creation - failed!"
        })
        return
    }
}

export async function elimina_slot_seduta(req:Request,res:Response) {
    //controllo accesso, solo terapeuta
    if(req.body.loggedUser.ruolo!=2){
        res.status(403).json({
            successful: false,
            message: "Request denied!"
        })
        return
    }

    // controllo presenza campi
    const data=req.body.data
    if(!data){
        res.status(400).json({
            successful: false,
            message: "Not enough arguments!"
        })
        return
    }

    try{
        let seduta_presente = await Seduta.findOneAndDelete({data:data, terapeuta:req.body.loggedUser._id, abilitato:true}).exec()
        if(!seduta_presente){  
            res.status(409).json({
                successful: false,
                message: "Element doesn’t exist or can’t be removed!"
            })
            return
        }else{
            if(seduta_presente.cliente!=""){
                let cliente = await Cliente.findById(seduta_presente.cliente).exec()
                aggiungi_gettoni(seduta_presente.cliente as string,1)
                await send_mail("Annullamento Prenotazione","La sua prenotazione è stata annullata",cliente.email.toString())
            }
            res.status(200).json({
                successful: true,
                message: "Slot successfully deleted!"
            })
            return
        }
    }catch(err){
        res.status(500).json({
            successful: false,
            message: "Server error in slot removal - failed!"
        })
        return
    }
}

export async function prenota_seduta(req:Request,res:Response) {
    //controllo accesso, solo cliente
    if(req.body.loggedUser.ruolo!=1){
        res.status(403).json({
            successful: false,
            message: "Request denied!"
        })
        return
    }

    // controllo presenza campi
    const data=req.body.data
    if(!data){
        res.status(400).json({
            successful: false,
            message: "Not enough arguments!"
        })
        return
    }
    try{
        //nessun terapeuta associato
        let cliente = await Cliente.findById(req.body.loggedUser._id).exec()
        if(cliente.associato==""){
            res.status(409).json({
                successful: false,
                message: "No therapist associated!"
            })
            return
        }
    
        let seduta = await Seduta.findOneAndUpdate({terapeuta:cliente.associato, data:data, cliente:""},{cliente:req.body.loggedUser._id},{new:true})
        if(!seduta){
            res.status(409).json({
                successful: false,
                message: "Element doesn’t exist or can’t be booked or unbooked!"
            })
            return
        }else{
            // email conferma prenotazione
            let promemoria_prenotazione = new Date(seduta.data)
            promemoria_prenotazione.setDate(promemoria_prenotazione.getDate()-1)
        
            const job = scheduler.scheduleJob(promemoria_prenotazione,async function(seduta:ISeduta) {
                //mail di promemoria
                await send_mail("Promemoria Prenotazione","Le ricordiamo la sua prenotazione in data: "+seduta.data,cliente.email.toString())
                //set annullabile a false
                await Seduta.findOneAndUpdate({data:seduta.data,terapeuta:seduta.terapeuta},{abilitato:false}).exec()
            }.bind(null,seduta))

            // togli gettone
            await aggiungi_gettoni(req.body.loggedUser._id, -1)

            res.status(200).json({
                successful: true,
                message: "Booking successful!"
            })
            return
        }
    }catch(err){
        res.status(500).json({
            successful: false,
            message: "Server error in booking - failed!"
        })
        return
    }
}

export async function remove_prenotazioni_if_disassociato(id_cliente:string, id_terapeuta:String) {
    try{
        let sedute_modificate=await Seduta.updateMany({cliente:id_cliente, terapeuta:id_terapeuta, abilitato:true},{cliente:""}).exec()
        
        // riaccredita gettoni pari al numero di sedute annullate, ancora annullabili
        await aggiungi_gettoni(id_cliente, sedute_modificate.modifiedCount)
        await Seduta.updateMany({cliente:id_cliente, terapeuta:id_terapeuta},{cliente:""}).exec()
    }catch(err){
        return false
    }
    return true
}

export async function annulla_prenotazione_seduta(req:Request,res:Response) {
    //controllo accesso, solo cliente
    if(req.body.loggedUser.ruolo!=1){
        res.status(403).json({
            successful: false,
            message: "Request denied!"
        })
        return
    }

    // controllo presenza campi
    const data=req.body.data
    if(!data){
        res.status(400).json({
            successful: false,
            message: "Not enough arguments!"
        })
        return
    }

    try{
        // posso farlo perchè se tolgo l'associazione elimino automaticamente tutte le prenotazioni
        let seduta= await Seduta.findOneAndUpdate({data:data, cliente:req.body.loggedUser._id}, {cliente:""}).exec()
        if(!seduta){
            res.status(409).json({
                successful: false,
                message: "Element doesn’t exist or can’t be booked or unbooked!"
            })
            return
        }else{
            if((new Date(seduta.data).getTime()<=Date.now()+86400000)){
                // riaccredita gettoni al cliente
                await aggiungi_gettoni(req.body.loggedUser._id, 1)
            }
            // email di conferma annullamento
            let cliente = await Cliente.findById(seduta.cliente).exec() 
            await send_mail("Annullamento Prenotazione","La sua prenotazione è stata annullata",cliente.email.toString())

            res.status(200).json({
                successful: true,
                message: "Booking deleted!"
            })
            return
        }
    }catch(err){
        res.status(500).json({
            successful: false,
            message: "Server error in deleting booked seat - failed!"
        })
        return
    }
}

export async function mostra_calendario_completo(req:Request, res:Response){
    try{

        //elimina le sedute scadute
        const tutteLeSedute = await Seduta.find().exec()
        for (let i = 0; i < tutteLeSedute.length; i++) {
            if (tutteLeSedute[i].data.getTime() < Date.now()) {
                await Seduta.findOneAndDelete({ data: tutteLeSedute[i].data }).exec()
            }
        }
        
        if(req.body.loggedUser.ruolo==1){
            res.status(200).json({
                successful: true,
                sedute: await Seduta.find({cliente:req.body.loggedUser._id}).exec(),
                message: "Client calendar successfully shown!"
            })
            return
        }else if(req.body.loggedUser.ruolo==2){
            res.status(200).json({
                successful: true,
                sedute: await Seduta.find({terapeuta:req.body.loggedUser._id}).exec(),
                message: "Therapist calendar successfully shown!"
            })
            return
        }
    }catch(err){
        res.status(500).json({
            successful: false,
            message: "Server error in calendar showing- failed!"
        })
        return
    }
}

export async function mostra_calendario_disponibili(req:Request, res:Response){
    try{

        //elimina le sedute scadute
        const tutteLeSedute = await Seduta.find().exec()
        for (let i = 0; i < tutteLeSedute.length; i++) {
            if (tutteLeSedute[i].data.getTime() < Date.now()) {
                await Seduta.findOneAndDelete({ data: tutteLeSedute[i].data }).exec()
            }
        }

        if(req.body.loggedUser.ruolo==1){
            let cliente=await Cliente.findById(req.body.loggedUser._id).exec()

            res.status(200).json({
                successful: true,
                sedute: await Seduta.find({cliente:"", terapeuta:cliente.associato}).exec(),
                message: "Client calendar successfully shown!"
            })
            return
        }else if(req.body.loggedUser.ruolo==2){
            res.status(200).json({
                successful: true,
                sedute: await Seduta.find({terapeuta:req.body.loggedUser._id, cliente:""}).exec(),
                message: "Therapist calendar successfully shown!"
            })
            return
        }
    }catch(err){
        res.status(500).json({
            successful: false,
            message: "Server error in calendar showing- failed!"
        })
        return
    }
}

export async function mostra_calendario_prenotate(req:Request, res:Response){
    try{

        //elimina le sedute scadute
        const tutteLeSedute = await Seduta.find().exec()
        for (let i = 0; i < tutteLeSedute.length; i++) {
            if (tutteLeSedute[i].data.getTime() < Date.now()) {
                await Seduta.findOneAndDelete({ data: tutteLeSedute[i].data }).exec()
            }
        }


        if(req.body.loggedUser.ruolo==1){
            res.status(200).json({
                successful: true,
                sedute: await Seduta.find({cliente:req.body.loggedUser._id}).exec(),
                message: "Client calendar successfully shown!"
            })
            return
        }else if(req.body.loggedUser.ruolo==2){
            res.status(200).json({
                successful: true,
                sedute: await Seduta.find({terapeuta:req.body.loggedUser._id, cliente:{$ne:""}}).exec(),
                message: "Therapist calendar successfully shown!"
            })
            return
        }
    }catch(err){
        res.status(500).json({
            successful: false,
            message: "Server error in calendar showing- failed!"
        })
        return
    }
}