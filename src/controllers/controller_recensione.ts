import { Request,Response,NextFunction } from 'express'
import { Cliente } from '../schemas/cliente_schema'
import { Terapeuta} from '../schemas/terapeuta_schema'
import mongoose from 'mongoose'
import { Recensione, IRecensione } from '../schemas/recensione_schema'

// metodo per leggere le recensioni del terapeuta di cui si sta visitando il profilo
export async function read_recensioni(req:Request,res:Response,next:NextFunction) {

    // controllo ruolo
    if(req.body.loggedUser.ruolo!=1){
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
        const catalogo_recensioni =await Recensione.find({recensito:req.params.id}).exec()

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
        next()
        return
    }
}

// metodo attraverso cui un terapeuta legge le sue stesse recensioni
export async function read_my_recensioni(req:Request,res:Response,next:NextFunction) {
    
    // controllo ruolo
    if(req.body.loggedUser.ruolo!=2){
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
        const catalogo_recensioni =await Recensione.find({recensito:req.body.loggedUser._id}, {}).exec()

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
        next()
        return
    }
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
            // salva nel db e aggiungi recensione al terapeuta
            await schema_recensione.save();
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
