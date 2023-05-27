import {Router, Request, Response, NextFunction} from 'express'
import { tokenCheck } from '../controllers/token_checker'
import { get_all_associati,associazione,rimuovi_associazione } from '../controllers/controller_associazione'

export const associazione_router = Router()


associazione_router.get('/catalogo_associati', tokenCheck, get_all_associati ,(req:Request,res:Response)=>{
    res.json(req.body)
})

associazione_router.get('/associazione/:id',tokenCheck, associazione,(req:Request,res:Response)=>{
    res.json(req.body)
})
associazione_router.get('/associazione/rimuovi/:id',tokenCheck,rimuovi_associazione,(req:Request,res:Response)=>{
    res.json(req.body)
})