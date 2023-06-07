import {Router, Request, Response, NextFunction} from 'express'
import { tokenCheck } from '../controllers/token_checker'
import { gestisci_segnalazione, get_all_segnalazioni, segnala } from '../controllers/controller_segnalazione';
import { defret } from './routes';


export const segnalazioni_router = Router()

segnalazioni_router.post('/segnalazione/:id' ,tokenCheck, segnala, (req:Request,res:Response)=>{
    res.json(req.body)
})

segnalazioni_router.get('/catalogo_segnalazioni',tokenCheck, get_all_segnalazioni, (req:Request,res:Response)=>{
    res.json(req.body)
})

segnalazioni_router.post('/segnalazione/gestisci/:id' ,tokenCheck, gestisci_segnalazione, (req:Request,res:Response)=>{
    res.json(req.body)
})