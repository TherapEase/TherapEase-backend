import { Request,Response,NextFunction } from 'express'
import {Cliente, ICliente} from '../schemas/cliente_schema'
import {Utente,IUtente} from '../schemas/utente_schema'
import { Terapeuta, ITerapeuta } from '../schemas/terapeuta_schema'
import { Segnalazione, ISegnalazione } from '../schemas/segnalazione_schema'
import mongoose from 'mongoose'
import scheduler from 'node-schedule'
import { send_mail } from './gmail_connector'

//cose che ci servono per le segnalazioni
//metodo per segnalare qualcuno (simil associazione e disassociazione)
//metodo per gestire (aka rimuovere) una segnalazione
//metodo per visualizzare tutte le segnalazioni

export async function get_all_segnalazioni(req:Request,res:Response,next:NextFunction) {
    

    try {
        await mongoose.connect(process.env.DB_CONNECTION_STRING)

    
        console.log("dbconnesso")
        const catalogo_segnalazioni =await Segnalazione.find({gestita:false}, {}).exec()   //prendo tutte le segnalazioni
        
        console.log(catalogo_segnalazioni)
        res.status(200)
        req.body={
            successful:true,
            message:"All reports retrieved successfully",
            catalogo: catalogo_segnalazioni
        }
        next()
        return
    } catch (err) {
        res.status(500)
        req.body={
            successful:false,
            message:"Server error in report catalog - failed!"
        }
    }
    next()
}

export async function gestisci_segnalazione(req:Request,res:Response,next:NextFunction) {
        // controllo ruolo
        if(req.body.loggedUser.ruolo!=4){
            res.status(403)
            req.body={
                successful: false,
                message: "Request denied - Invalid role"
            }
            next()
            return 
        }
    
        try{
            // controllo presenza della segnalazione
            await mongoose.connect(process.env.DB_CONNECTION_STRING)
            let segnalazione= await Segnalazione.findOneAndUpdate({_id:req.params.id}, {gestita:true}).exec()
            if(!segnalazione){
                res.status(409)
                req.body={
                    successful: false,
                    message: "Element doesn’t exist!"
                }
                next()
                return 
            }else{
            
                res.status(200)
                req.body={
                    
                    successful: true,
                    message: "Report successfully managed!"
                }
                next()
                return 
            }
        }catch(err){
            res.status(500)
            req.body={
                successful: false,
                message: "Server error in report management - failed!"
            }
            next()
            return 
        }
}

export async function segnala(req:Request,res:Response,next:NextFunction) {
    

//ragioniamo su cosa devo fare
/*Prima devo controllare che il ruolo sia quello di un cliente o di un terapeuta altrimenti la cosa non funziona
Poi devo controllare che questo cliente e questo terapeuta esistano
Poi devo controllare che questi due siano associati altrimenti non si può effettuare la segnalazione
Se tutte queste condizioni sono verificate allora posso generare una segnalazione
*/ 

if(req.body.loggedUser.ruolo!=1 && req.body.loggedUser.ruolo!=2){
    res.status(403)
    req.body={
        successful: false,
        message: "Request denied - Invalid role"
    }
    next()
    return 
}

if(req.body.loggedUser.ruolo == 1) { 
    //siamo nel caso in cui un cliente segnala un terapeuta
        const id_terapeuta=req.params.id

        await mongoose.connect(process.env.DB_CONNECTION_STRING)
        //trova cliente e terapeuta coinvolti
        //let cliente = await Cliente.findById(id_cliente).exec()
        let cliente = req.body.loggedUser
        let terapeuta=await Terapeuta.findById(id_terapeuta).exec()

        console.log("cliente: "+JSON.stringify(cliente))
        console.log("terapeuta: "+terapeuta)

        if(!(terapeuta&&cliente)){    //se non trovo uno di questi due user fallisce tutto
            res.status(404)
            req.body={
                successful: false,
                message: "User not found!"
            }
            next()
            return      
        }

        //devo controllare che i ruoli del cliente e del terapeuta siano corretti altrimenti niente funziona

        if(cliente.ruolo!=1 || terapeuta.ruolo!=2){    //
            res.status(403)
            req.body={
                successful: false,
                message: "Invalid role!"
            }
            next()
            return  
        }

        const id_cliente = req.body.loggedUser._id
        

        console.log("id cliente: "+id_cliente)
        console.log("id terapeuta: "+id_terapeuta)

        //ora devo controllare che sti due utenti siano associati tra loro 
        if(!(terapeuta.associati.includes(id_cliente.toString())||cliente.associato==(id_terapeuta.toString()))){       
            res.status(409)
            req.body={
                successful:false,
                message: "Client and therapist are not associated!"
            }
            next()
            return
        }

        //creazione della segnalazione
        const segnalato=id_terapeuta
        const testo=req.body.testo
        const data=req.body.data
        const gestita=req.body.gestita

        if( !testo || !data){
            res.status(400)
            req.body={
                successful: false,
                message: "Not enough arguments!"
            }
            next()
            return
        }

        try{
            // controllo se esiste già
            await mongoose.connect(process.env.DB_CONNECTION_STRING)
            let esistente = await Segnalazione.findOne({segnalato:segnalato, testo:testo, data:data}).exec()
            if(esistente){
                res.status(409)
                req.body={
                    successful: false,
                    message: "Report already present!"
                }
                next()
                return 
            }else{
                const schema_segnalazione= new Segnalazione<ISegnalazione>({
                    segnalato:segnalato,
                    testo:testo, 
                    data:data,
                    gestita: gestita
                });
                await Segnalazione.create(schema_segnalazione)
                res.status(200)
                req.body={
                    successful: true,
                    message: "Report successfully inserted!"
                }
                next()
                return
            }
    
        }catch(err){
            res.status(500)
            req.body={
                successful: false,
                message: "Server error in report creation - failed!"
            }
            next()
            return 
        }
} else if(req.body.loggedUser.ruolo == 2) {
    //adesso devo gestire il caso in cui a segnalare il cliente è un terapeuta

    const id_cliente=req.params.id

        await mongoose.connect(process.env.DB_CONNECTION_STRING)
        //trova cliente e terapeuta coinvolti
        //let cliente = await Cliente.findById(id_cliente).exec()
        let terapeuta = req.body.loggedUser
        let cliente=await Cliente.findById(id_cliente).exec()

        console.log("terapeuta: "+JSON.stringify(terapeuta))
        console.log("cliente: "+cliente)

        if(!(terapeuta&&cliente)){    //se non trovo uno di questi due user fallisce tutto
            res.status(404)
            req.body={
                successful: false,
                message: "User not found!"
            }
            next()
            return      
        }

        //devo controllare che i ruoli del cliente e del terapeuta siano corretti altrimenti niente funziona

        if(cliente.ruolo!=1 || terapeuta.ruolo!=2){    //
            res.status(403)
            req.body={
                successful: false,
                message: "Invalid role!"
            }
            next()
            return  
        }

        const id_terapeuta = req.body.loggedUser._id
        

        console.log("id cliente: "+id_cliente)
        console.log("id terapeuta: "+id_terapeuta)

        //ora devo controllare che sti due utenti siano associati tra loro 
        
        if(!(cliente.associato==id_terapeuta || terapeuta.associati.includes(id_cliente))) {
            res.status(409)
            req.body={
                successful:false,
                message: "Client and therapist are not associated!"
            }
            next()
            return
        }

        //creazione della segnalazione
        const segnalato=id_cliente
        const testo=req.body.testo
        const data=req.body.data
        const gestita=req.body.gestita

        if( !testo || !data){
            res.status(400)
            req.body={
                successful: false,
                message: "Not enough arguments!"
            }
            next()
            return
        }

        try{
            // controllo se esiste già
            await mongoose.connect(process.env.DB_CONNECTION_STRING)
            let esistente = await Segnalazione.findOne({segnalato:segnalato, testo:testo, data:data}).exec()
            if(esistente){
                res.status(409)
                req.body={
                    successful: false,
                    message: "Report already present!"
                }
                next()
                return 
            }else{
                const schema_segnalazione= new Segnalazione<ISegnalazione>({
                    segnalato:segnalato,
                    testo:testo, 
                    data:data,
                    gestita:gestita
                });
                await Segnalazione.create(schema_segnalazione)
                res.status(200)
                req.body={
                    successful: true,
                    message: "Report successfully inserted!"
                }
                next()
                return
            }
    
        }catch(err){
            res.status(500)
            req.body={
                successful: false,
                message: "Server error in report creation - failed!"
            }
            next()
            return 
        }


}


}