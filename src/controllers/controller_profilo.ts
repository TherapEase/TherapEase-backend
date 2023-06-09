import { Request,Response,NextFunction } from 'express'
import mongoose from 'mongoose'

import {Cliente, ICliente} from '../schemas/cliente_schema'
import {Utente,IUtente} from '../schemas/utente_schema'
import { Terapeuta, ITerapeuta } from '../schemas/terapeuta_schema'

export async function get_all_terapeuti(req:Request,res:Response,next:NextFunction) {
    try {
        await mongoose.connect(process.env.DB_CONNECTION_STRING)
        // console.log("dbconnesso")
        const catalogo_terapeuti=await Terapeuta.find({ruolo:2}, 'nome cognome foto_profilo')
        // console.log(catalogo_terapeuti)
        res.status(200)
        req.body={
            successful:true,
            message:"Therapist catalog retrieved successfully!",
            catalogo: catalogo_terapeuti
        }
    } catch (err) {
        res.status(500)
        req.body={
            successful:false,
            message:"Server error in therapist catalog - failed!"
        }
    }
    next()
}

export async function get_my_profilo(req:Request,res:Response,next:NextFunction){
    /**
     * 
     * Questa funzione è dedita al recupero del proprio profilo per la visualizzazione delle informazioni personali
     * La richiesta contiene il token decodificato-> _id,username,ruolo. 
     * La verifica dell'esistenza dell'utente è già stata eseguita
     */

    try {
        await mongoose.connect(process.env.DB_CONNECTION_STRING)
        let utente: IUtente|ITerapeuta
        if(req.body.loggedUser.ruolo==1)
            utente = await Cliente.findById(req.body.loggedUser._id,'username ruolo nome cognome email email_confermata cf foto_profilo data_nascita n_gettoni associato').exec()
        else if (req.body.loggedUser.ruolo==2)
            utente = await Terapeuta.findById(req.body.loggedUser._id,'username ruolo nome cognome email email_confermata cf foto_profilo data_nascita associati abilitato limite_clienti indirizzo').exec()
        else{
            utente = await Utente.findById(req.body.loggedUser._id,'username ruolo').exec()
        }
        res.status(200)
        req.body={
            successful:true,
            message:"My_profile obtained successfully!",
            profile:utente
        }
        next()
        return
    } catch (error) {
        res.status(500)
        req.body={
            successful:false,
            message:"Server error in retrieving my_profile - failed!"
        }
        next()
        return
    }
}

export async function modify_profilo(req:Request,res:Response,next:NextFunction) {
    /**
     * CAMPI MODIFICABILI:
     * nome
     * cognome
     * email -->non più verificata
     * cf
     * foto_profilo
     * data_nascita
     * 
     * PER IL TERAPEUTA
     * limite_clienti
     * indirizzo
     * documenti
     */

    try {
        await mongoose.connect(process.env.DB_CONNECTION_STRING)
        if(req.body.loggedUser.ruolo==1){
            const cliente = await Cliente.findById(req.body.loggedUser._id).exec()
            let updated_data ={
                nome: req.body.nome?req.body.nome : cliente.nome,
                cognome: req.body.cognome?req.body.cognome : cliente.nome,
                email:req.body.email?req.body.email : cliente.email,
                email_confermata:req.body.email?false:true,
                cf:req.body.cf?req.body.cf : cliente.cf,
                foto_profilo:req.body.foto_profilo?req.body.foto_profilo : cliente.foto_profilo,
                data_nascita: req.body.data_nascita?req.body.data_nascita : cliente.data_nascita
            }
    
            const updated_cliente = await Cliente.findByIdAndUpdate(cliente._id,{
                nome:updated_data.nome,
                cognome:updated_data.cognome,
                email:updated_data.email,
                email_confermata:updated_data.email_confermata,
                cf:updated_data.cf,
                foto_profilo:updated_data.foto_profilo,
                data_nascita:updated_data.data_nascita,
            },{new:true}).exec()
        }else if(req.body.loggedUser.ruolo==2){

            const terapeuta = await Terapeuta.findById(req.body.loggedUser._id).exec()
    
            let updated_data ={
                nome: req.body.nome?req.body.nome : terapeuta.nome,
                cognome: req.body.cognome?req.body.cognome : terapeuta.nome,
                email:req.body.email?req.body.email : terapeuta.email,
                email_confermata:req.body.email?false:true,
                cf:req.body.cf?req.body.cf : terapeuta.cf,
                foto_profilo:req.body.foto_profilo?req.body.foto_profilo : terapeuta.foto_profilo,
                data_nascita: req.body.data_nascita?req.body.data_nascita : terapeuta.data_nascita,
                limite_clienti: req.body.limite_clienti?req.body.limite_clienti : terapeuta.limite_clienti,
                indirizzo:req.body.data_nascita?req.body.indirizzo : terapeuta.indirizzo,
                documenti: req.body.documenti? req.body.documenti : terapeuta.documenti
            }
    
            const updated_cliente = await Terapeuta.findByIdAndUpdate(terapeuta._id,{
                nome:updated_data.nome,
                cognome:updated_data.cognome,
                email:updated_data.email,
                email_confermata:updated_data.email_confermata,
                cf:updated_data.cf,
                foto_profilo:updated_data.foto_profilo,
                data_nascita:updated_data.data_nascita,
                limite_clienti: updated_data.limite_clienti,
                indirizzo:updated_data.indirizzo,
                documenti: updated_data.documenti
            },{new:true}).exec()
        }
        res.status(200)
        req.body={
            successful:true,
            message:"My_profile updated successfully!"
        }
        next()
        return
    } catch (error) {
        res.status(500)
        req.body={
            successful:false,
            message: "Server error in updating my_profile - failed!"
        }
    }
    
}

export async function get_profilo(req:Request, res:Response, next: NextFunction) {
    try {
        mongoose.connect(process.env.DB_CONNECTION_STRING)
        /**
         * Restituisce i dati "pubblici" di un profilo
         * si potrebbe fare un controllo dei permessi tramite token
         * questo dipende se bisogna essere autenticati per ottenere il profilo
         * 
         * l'alternativa è non autenticarsi, utile per recuperare i singoli profili del catalogo
         * sarebbe meglio autenticato così si possono restituire cose come il diario, ma bisogna determinare i permessi
         */
        let richiedente:ICliente|ITerapeuta
        if(req.body.loggedUser.ruolo==1)
            richiedente= await Cliente.findById(req.body.loggedUser._id).exec()
        else if(req.body.loggedUser.ruolo==2)
            richiedente = await Terapeuta.findById(req.body.loggedUser._id).exec()
        else{
            res.status(403)
            req.body={
                successful:false,
                message:"Invalid role!"
            }
            next()
            return
        }

        let utente:IUtente|ICliente|ITerapeuta = await Utente.findById(req.params.id).exec()
        if(!utente){
            res.status(404),
            req.body={
                successful:false,
                message:"User not found!"
            }
            next()
            return
        }
        if(utente.ruolo==1)
            utente = await Cliente.findById(req.params.id,'username ruolo nome cognome email foto_profilo data_nascita diario').exec()
        else if(utente.ruolo==2)
            utente = await Terapeuta.findById(req.params.id,'username ruolo nome cognome email cf foto_profilo data_nascita associati limite_clienti indirizzo recensioni').exec()
        
        /**
         * 
         * CHECK PERMESSI:
         * Il terapeuta può vedere il profilo dei suoi clienti
         * Il cliente può vedere il profilo di ogni terapeuta
         * 
         */

        if(richiedente.ruolo==utente.ruolo||((richiedente instanceof Terapeuta)&&!(richiedente as ITerapeuta).associati.includes(req.params.id))){
            res.status(403)
            req.body={
                successful: false,
                message: "Request denied!"
            }
            next()
            return
        }

        res.status(200)
        req.body={
            successful:true,
            message:"Profile obtained successfully!",
            profilo:utente
        }
        next()
    } catch (error) {
        res.status(500)
        req.body={
            successful:false,
            message:"Server error in retrieving profile - failed!"
        }
        next()
    }
}

export async function delete_profilo(req:Request,res:Response,next:NextFunction){
    /**
     * DELETE /path --> non ha body
     */
    const _id = req.params.id
    if(!_id){
        res.status(400)
        req.body={
            successful:false,
            message:"Not enough arguments!"
        }
    }
       //se _id e token corrispondono o se il token è amministrativo allora posso eliminare
    if(!(req.body.loggedUser._id==_id||req.body.loggedUser.ruolo==4)){
        res.status(403)
        req.body={
            successful:false,
            message:"Not authorized to delete this profile!"
        }
    }
    try {
        await mongoose.connect(process.env.DB_CONNECTION_STRING)
        let utente = await Utente.findByIdAndDelete(_id).exec()
        if(!utente){
            res.status(404)
            req.body={
                successful:false,
                message:"This user doesn't exist!"
            }
            next()
            return
        }
        res.status(200)
        req.body={
            successful:true,
            message:"User deleted successfully!"
        }
        next()
        return
    } catch (error) {
        res.status(500)
        req.body={
            successful:false,
            message:"Internal server error!"
        }
        next()
        return
    }
}

export async function get_all_clienti(req:Request,res:Response,next:NextFunction) {
    try {
        await mongoose.connect(process.env.DB_CONNECTION_STRING)
        // console.log("dbconnesso")
        const catalogo_clienti=await Cliente.find({ruolo:1}, 'nome cognome foto_profilo')
        // console.log(catalogo_terapeuti)
        res.status(200)
        req.body={
            successful:true,
            message:"Client catalog retrieved successfully!",
            catalogo: catalogo_clienti
        }
    } catch (err) {
        res.status(500)
        req.body={
            successful:false,
            message:"Server error in client catalog - failed!"
        }
    }
    next()
}

/**
 * 
 * TODO: aggiungere unique ai campi univoci degli schemi
 *       trovare il punto dove chiamare SCHEMA.CreateIndex() per inizializzare gli indici (?)
 */


