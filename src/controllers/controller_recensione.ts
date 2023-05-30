import { Request,Response,NextFunction } from 'express'
import {Cliente, ICliente} from '../schemas/cliente_schema'
import {Utente,IUtente} from '../schemas/utente_schema'
import { Terapeuta, ITerapeuta } from '../schemas/terapeuta_schema'
import mongoose from 'mongoose'
import scheduler from 'node-schedule'
import { send_mail } from './gmail_connector'
import { Recensione, IRecensione } from '../schemas/recensione_schema'


export async function read_recensioni_associato(req:Request,res:Response,next:NextFunction) {
    console.log(req.body.loggedUser.ruolo)

    if(req.body.loggedUser.ruolo!=1){ //se non sei un cliente 
        res.status(403)
        req.body={
            successful:false,
            message:"Invalid role!"
        }
        next()
        return
    }

    

        try {
            await mongoose.connect(process.env.DB_CONNECTION_STRING)
    
        
            console.log("dbconnesso")
            const catalogo_recensioni =await Recensione.find({recensito:req.params.id}, {}).exec()   //prendo tutte le recensioni
            
            console.log(catalogo_recensioni)
            res.status(200)
            req.body={
                successful:true,
                message:"All reviews retrieved successfully",
                catalogo: catalogo_recensioni
            }
            next()
            return
        } catch (err) {
            res.status(500)
            req.body={
                successful:false,
                message:"Server error in review catalog - failed!"
            }
        }
        next()
    
}

export async function read_my_recensioni(req:Request,res:Response,next:NextFunction) {
    console.log(req.body.loggedUser.ruolo)

    if(req.body.loggedUser.ruolo!=2){ //se non sei un cliente o un terapeuta
        res.status(403)
        req.body={
            successful:false,
            message:"Invalid role!"
        }
        next()
        return
    }


        try {
            await mongoose.connect(process.env.DB_CONNECTION_STRING)

            const my_id = req.body.loggedUser._id
    
        
            console.log("dbconnesso")
            const catalogo_recensioni =await Recensione.find({recensito:my_id}, {}).exec()   //prendo tutte le recensioni
            
            console.log(catalogo_recensioni)
            res.status(200)
            req.body={
                successful:true,
                message:"All reviews retrieved successfully",
                catalogo: catalogo_recensioni
            }
            next()
            return
        } catch (err) {
            res.status(500)
            req.body={
                successful:false,
                message:"Server error in review catalog - failed!"
            }
        }
        next()
    
}




export async function scrivi_recensione(req:Request,res:Response,next:NextFunction) {

    //cose che bisogna controllare
    //solo un cliente può scrivere una recensione
    //il cliente deve essere associato al terapeuta


    if(req.body.loggedUser.ruolo!=1){ //se non sei un cliente
        res.status(403)
        req.body={
            successful:false,
            message:"Invalid role!"
        }
        next()
        return
    }

    const id_terapeuta=req.params.id     //prendo l'id del terapeuta dai parametri

        await mongoose.connect(process.env.DB_CONNECTION_STRING)
        let cliente = req.body.loggedUser    //il cliente è quello al momento loggato nel sito
        let terapeuta=await Terapeuta.findById(id_terapeuta).exec()   //cerco il terapeuta

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

        //creazione della recensione

        const voto=req.body.voto
        const testo=req.body.testo
        const autore=req.body.loggedUser.username
        const data=req.body.data
        const recensito=id_terapeuta

        if(!voto || !data) {
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
            let esistente = await Recensione.findOne({voto:voto, testo:testo, autore:autore, data:data}).exec()
            if(esistente){
                res.status(409)
                req.body={
                    successful: false,
                    message: "Review already present!"
                }
                next()
                return 
            }else{
                const schema_recensione= new Recensione<IRecensione>({
                    voto:voto,
                    testo:testo, 
                    autore:autore,
                    data:data,
                    recensito:recensito
                });
                await schema_recensione.save();
                res.status(200)
                req.body={
                    successful: true,
                    message: "Review successfully inserted!"
                }

                //aggiungi recensione al terapeuta
                await Terapeuta.findByIdAndUpdate({_id:id_terapeuta}, {$push:{recensioni:schema_recensione._id.toString()}}) 

                next()
                return
            }
    
        }catch(err){
            res.status(500)
            req.body={
                successful: false,
                message: "Server error in review creation - failed! "+err
            }
            next()
            return 
        }












}
