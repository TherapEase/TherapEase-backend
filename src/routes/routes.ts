import { json } from 'body-parser';
import {Router,Request,Response,NextFunction} from 'express'
import { registrazione } from '../controllers/controller_utente';
import { login } from '../controllers/controller_utente';
import { crea_slot_seduta, elimina_slot_seduta, prenota_seduta} from '../controllers/controller_sedute';
import { tokenCheck } from '../controllers/token_checker';
//import cors from 'cors';

export const defaultRoute = Router()

defaultRoute.get('/',(req,res)=>{
    res.send("sono nel router");
})

defaultRoute.use('/test',(req:Request,res:Response)=>{
    res.json(req.body)
})
defaultRoute.post('/registrazione',registrazione,async (req:Request,res:Response)=>{
    res.json(req.body)
})
defaultRoute.post('/login', login ,(req:Request,res:Response)=>{
    res.json(req.body)
})

defaultRoute.use('/authexample',tokenCheck,(req:Request,res:Response)=>{
    res.status(200).json({
        successful:true,
        message: "token verification ok",
        loggedUser: req.body.loggedUser
    })
})

defaultRoute.post('/definisci_slot', tokenCheck, crea_slot_seduta,(req:Request,res:Response)=>{
    res.json(req.body)
})

defaultRoute.post('/definisci_slot/elimina', tokenCheck, elimina_slot_seduta,(req:Request,res:Response)=>{
    res.json(req.body)
})

defaultRoute.post('/prenotazione', tokenCheck, prenota_seduta,(req:Request,res:Response)=>{
    res.json(req.body)
})


//SEDUTE FITRATE PER CLIENTE (CALENDARIO CLIENTE)
//SEDUTE FITRATE PER TERAPEUTA (CALENDARIO TERAPEUTA) -> slot gia definiti
    //distinzione tra sedute prenotate, libere, tutte