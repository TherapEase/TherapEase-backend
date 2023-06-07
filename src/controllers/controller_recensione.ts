import { Request,Response,NextFunction } from 'express'
import {Cliente, ICliente} from '../schemas/cliente_schema'
import {Utente,IUtente} from '../schemas/utente_schema'
import { Terapeuta, ITerapeuta } from '../schemas/terapeuta_schema'
import mongoose from 'mongoose'
import scheduler from 'node-schedule'
import { send_mail } from './gmail_connector'
import { Recensione, IRecensione } from '../schemas/recensione_schema'


export async function read_recensioni(req:Request,res:Response,next:NextFunction) {
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

            //const io = await Cliente.findById({_id:req.body.loggedUser._id}, 'associato')
            
            //const id_associato = io
            
    

        
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
                message:"Server error in review catalog - failed!"+err
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

    // controllo ruolo, imposto cliente
    if(req.body.loggedUser.ruolo!=1){ 
        res.status(403)
        req.body={
            successful:false,
            message:"Invalid role!"
        }
        next()
        return
    }
  
    await mongoose.connect(process.env.DB_CONNECTION_STRING)
    let cliente = await Cliente.findById(req.body.loggedUser._id).exec()

    if(cliente.associato==""){
        res.status(409)
        req.body={
            successful:false,
            message:"Client not associated to any therapist!"
        }
        next()
        return
    }

    let terapeuta=await Terapeuta.findById(cliente.associato).exec()   
    // controllo esistenza terapeuta
    if(!terapeuta){  
        res.status(404)
        req.body={
            successful: false,
            message: "User not found!"
        }
        next()
        return      
    }

    //controllo presenza campi
    const voto=req.body.voto
    const testo=req.body.testo
    const autore=req.body.loggedUser._id
    const data=new Date()
    const recensito=cliente.associato
    if(!voto || !testo) {
        res.status(400)
        req.body={
            successful: false,
            message: "Not enough arguments!"
        }
        next()
        return
    }

    if(voto<1 || voto>5){
        res.status(401)
        req.body={
            successful: false,
            message: "Invalid ''voto'', must be <5 and >1!"
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
            //aggiungi recensione al terapeuta
            await Terapeuta.findByIdAndUpdate({_id:terapeuta._id}, {$push:{recensioni:schema_recensione._id.toString()}}) 
            
            res.status(200)
            req.body={
                successful: true,
                message: "Review successfully inserted!"
            }
            next()
            return
        }

    }catch(err){
        res.status(500)
        req.body={
            successful: false,
            message: "Server error in review creation - failed! "
        }
        next()
        return 
    }
}
