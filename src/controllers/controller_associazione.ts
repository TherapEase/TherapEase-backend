import {Request,Response} from 'express'
import { Cliente, } from '../schemas/cliente_schema'
import { Terapeuta } from '../schemas/terapeuta_schema'
import { remove_prenotazioni_if_disassociato } from './controller_sedute'


async function remove_associazione_precedente(id_cliente: string) {
    
    try{
        const cliente=await Cliente.findById(id_cliente).exec() 
    
        if(cliente.associato==""){
            return true
        }else{
            const id_terapeuta=cliente.associato
            const terapeuta=await Terapeuta.findByIdAndUpdate(id_terapeuta, {$pull:{associati:id_cliente}},{new:true}).exec()
            if((terapeuta.associati.includes(cliente._id.toString()))){
                return true
            }else{
                const val=await remove_prenotazioni_if_disassociato(id_cliente, id_terapeuta)
                return val? true:false
            }
        }
    }catch (err){
        return false
    }  
}

export async function associazione(req:Request,res:Response) {
    
    const id_cliente=req.body.loggedUser._id
    const id_terapeuta=req.params.id
   

    try{
        let terapeuta=await Terapeuta.findById(id_terapeuta).exec()    
        let cliente= await Cliente.findById(id_cliente).exec()

        if(!(terapeuta&&cliente)){ 
            res.status(404).json({
                successful: false,
                message: "User not found!"
            })   
            return
        }
        if(cliente.ruolo!=1 || terapeuta.ruolo!=2){
            res.status(403).json({
                successful: false,
                message: "Invalid role!"
            })
            return
        }

        if(terapeuta.associati.length>=(terapeuta.limite_clienti as number)){
            res.status(409).json({
                successful: false,
                message: "Therapist full, impossible association!"
            })  
            return
        }


        /**
         * questo controllo permette di avere un cliente già associato ad un terapeuta ed associarlo ad un altro
         * se per disgrazia uno dei due campi non è stato salvato completamente (quindi riferimenti non matchati)
         * il test sull'associazione viene passato
         * quindi verrà scritto l'id del terapeuta nel cliente, e raddoppiato nel terapeuta
         * 
         * inoltre sperimentando ho trovato che "in" non funziona bene in questo caso (sotto chiamava comunque il rollback)
         * usare associati.includes sembra essere meglio
         */

        if(terapeuta.associati.includes(cliente._id.toString())&&cliente.associato==terapeuta._id.toString()){       
            res.status(409).json({
                successful:false,
                message: "Client and therapist already associated!"
            })
            return
        }

        //pulisce l'asssociazione precedente dal terapeuta precedente
        const val=await remove_associazione_precedente(id_cliente)
        if(!val){
            res.status(500).json({
                successful: false,
                message: "Server error in association - failed!"
            })
            return
        }
        
        /**
         * Se il campo del cliente è vuoto o contiene un terapeuta diverso ci associo quello nuovo 
         *      
         *      se si effettua una seconda chiamata con gli stessi dati il sistema si autocorregge (passo il check sopra e sovrascrivo correttamente)
         */

        if(cliente.associato!=terapeuta._id.toString())
            cliente = await Cliente.findByIdAndUpdate(id_cliente, {associato:id_terapeuta},{new:true}).exec()
        
        //lancio un errore se non dovesse andare a buon fine la scrittura nel db
        if(cliente.associato!=id_terapeuta){
            res.status(500).json({
                successful: false,
                message: "Server error in association - failed!"
            })
            return
        }

        /**
         * Stessa logica del cliente: se il cliente è associato ma non appare nell'array, passo il check e lo scrivo nell'array
         */
        if(!(terapeuta.associati.includes(cliente._id.toString())))
            terapeuta = await Terapeuta.findByIdAndUpdate(id_terapeuta, {$push:{associati:id_cliente}}, {new:true}).exec()
        
        /**
         * 
         * ROLLBACK: se non si è riusciti a scrivere nel terapeuta il cliente, 
         * si elimina da entrambi il riferimento all'altro
         * una nuova chiamata potrà essere ritentata
         * 
         * la parte di ROLLBACK può essere sostituita da rimuovi_associazione, che 
         * fa le stesse esatte cose
         * 
         */
        if(!(terapeuta.associati.includes(cliente._id.toString()))){
            //rollback associazione utente, che si suppone funzioni -> rimuovo eventuali link pendenti
            await Cliente.findByIdAndUpdate(id_cliente, {associato:""}).exec()
            await Terapeuta.findByIdAndUpdate(id_terapeuta,{$pull:{associati:id_cliente}}) 
            res.status(500).json({
                successful: false,
                message: "Server error in association - failed!"
            })
            return

        }
        res.status(200).json({
            successful:true,
            message:"Association successfully done!" 
        })
        return
    } catch (err) {
        res.status(500).json({
            successfull:false,
            message:"Server error in association - failed!"
        })
        return

    }
}

export async function rimuovi_associazione (req:Request, res:Response){
    /**
     * 
     * L'utente autenticato manda una richiesta di disassociazione con parametro l'id della controparte
     * Essendo autenticato, si determina il tipo di utente grazie al ruolo e si determina di conseguenza il tipo della controparte
     */
    let id_cliente:string, id_terapeuta:String
    if(req.body.loggedUser.ruolo==1){
        id_cliente=req.body.loggedUser._id
        id_terapeuta=req.params.id
    }
    else if(req.body.loggedUser.ruolo==2){
        id_terapeuta=req.body.loggedUser._id
        id_cliente=req.params.id
    }
    else{
        res.status(403).json({
            successful:false,
            message:"Invalid role!"
        })
        return

    }

    try {
        let cliente= await Cliente.findOne({_id:id_cliente, associato:id_terapeuta}).exec()
        let terapeuta = await Terapeuta.findOne({_id:id_terapeuta, associati:id_cliente}).exec()
        
        if(!(cliente&&terapeuta)){
            res.status(404).json({
                successful:false,
                message:"User not found!"
            })
            return

        }
        cliente = await Cliente.findOneAndUpdate({_id:id_cliente, associato:id_terapeuta},{associato:""},{new:true}).exec()
        terapeuta = await Terapeuta.findOneAndUpdate({_id:id_terapeuta, associati:id_cliente},{$pull:{associati:id_cliente}},{new:true}).exec()
        await remove_prenotazioni_if_disassociato(id_cliente, id_terapeuta)

        res.status(200).json({
            successful:true,
            message:"Association successfully removed!"
        })
        return

    } catch (error) {
        res.status(500).json({
            successful:false,
            message:"Server error in association removal - failed!"
        })
        return

    }
}

export async function get_all_associati(req:Request,res:Response) {
    if(req.body.loggedUser.ruolo!=2){
        res.status(403).json({
            successful:false,
            message:"Invalid role!"
        })
        return

    }
    
    
    try {
        let id_terapeuta=req.body.loggedUser._id
        const catalogo_associati =await Cliente.find({ruolo:1, associato:id_terapeuta}, 'nome cognome foto_profilo')
        
        res.status(200).json({
            successful:true,
            message:"Therapist's client catalog retrieved successfully!",
            catalogo: catalogo_associati
        })
        return

    } catch (err) {
        res.status(500).json({
            successful:false,
            message:"Server error in client catalog - failed!"
        })
        return

    }
}