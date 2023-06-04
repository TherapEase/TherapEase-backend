import {Router, Response, Request, NextFunction} from 'express'
import { tokenCheck } from '../controllers/token_checker'
import { aggiungi_evento, rimuovi_evento } from '../controllers/controller_info_eventi'



export const info_router= Router()
info_router.post('/aggiungi_evento' ,tokenCheck, aggiungi_evento, (req:Request,res:Response)=>{
    res.json(req.body)
})

info_router.get('/rimuovi_evento/:id' ,tokenCheck, rimuovi_evento, (req:Request,res:Response)=>{
    res.json(req.body)
})


