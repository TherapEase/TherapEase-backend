import { Request,Response} from 'express'
import { Cliente } from '../schemas/cliente_schema'
import { Terapeuta} from '../schemas/terapeuta_schema'
import { Recensione, IRecensione } from '../schemas/recensione_schema'

// metodo per leggere le recensioni del terapeuta di cui si sta visitando il profilo
export async function read_recensioni(req:Request,res:Response) {

    // controllo ruolo
    if(req.body.loggedUser.ruolo!=1){
        res.status(403).json({
            successful:false,
            message:"Invalid role!"
        })
        return
    }

    try {
        const catalogo_recensioni =await Recensione.find({recensito:req.params.id}).exec()

        res.status(200).json({
            successful:true,
            message:"All reviews retrieved successfully",
            catalogo: catalogo_recensioni
        })
        return
    } catch (err) {
        res.status(500).json({
            successful:false,
            message:"Server error in review catalog - failed!"+err
        })
        return
    }
}

// metodo attraverso cui un terapeuta legge le sue stesse recensioni
export async function read_my_recensioni(req:Request,res:Response) {
    
    // controllo ruolo
    if(req.body.loggedUser.ruolo!=2){
        res.status(403).json({
            successful:false,
            message:"Invalid role!"
        })
        return
    }
    try {
        const catalogo_recensioni =await Recensione.find({recensito:req.body.loggedUser._id}, {}).exec()

        res.status(200).json({
            successful:true,
            message:"All reviews retrieved successfully",
            catalogo: catalogo_recensioni
        })
        return
    } catch (err) {
        res.status(500).json({
            successful:false,
            message:"Server error in review catalog - failed!"
        })
        return
    }
}

export async function scrivi_recensione(req:Request,res:Response) {

    // controllo ruolo, imposto cliente
    if(req.body.loggedUser.ruolo!=1){ 
        res.status(403).json({
            successful:false,
            message:"Invalid role!"
        })
        return
    }
    try{
        let cliente = await Cliente.findById(req.body.loggedUser._id).exec()    //connessione al db senza try catch, sistemare

        if(cliente.associato==""){
            res.status(409).json({
                successful:false,
                message:"Client is not associated to a therapist!"
            })
            return
        }

        let terapeuta=await Terapeuta.findById(cliente.associato).exec()   
        // controllo esistenza terapeuta
        if(!terapeuta){  
            res.status(404).json({
                successful: false,
                message: "User not found!"
            })
            return
        }

        //controllo presenza campi
        const voto=req.body.voto
        const testo=req.body.testo
        const autore=req.body.loggedUser._id
        const data=new Date()
        const recensito=cliente.associato
        if(!voto || !testo) {
            res.status(400).json({
                successful: false,
                message: "Not enough arguments!"
            })
            return
        }


        if(voto<1 || voto>5){
            res.status(409).json({
                successful: false,
                message: "Invalid ''voto'', must be <5 and >1!"
            })
            return
        }

    
        // controllo se esiste già
        let esistente = await Recensione.findOne({voto:voto, testo:testo, autore:autore, data:data}).exec()
        if(esistente){
            res.status(409).json({
                successful: false,
                message: "Review already present!"
            })
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
            await Recensione.create(schema_recensione)
            await Terapeuta.findByIdAndUpdate({_id:terapeuta._id}, {$push:{recensioni:schema_recensione._id.toString()}}) 
            
            res.status(200).json({
                successful: true,
                message: "Review successfully inserted!"
            })
            return
        }
    }catch(err){
        res.status(500).json({
            successful: false,
            message: "Server error in review creation - failed! "
        })
        return
    }
}
