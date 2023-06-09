import {Router, Response, Request, NextFunction} from 'express'
import { tokenCheck } from '../controllers/token_checker'
import { aggiungi_evento, get_all_eventi, rimuovi_evento } from '../controllers/controller_info_eventi'



export const info_router= Router()
info_router.post('/aggiungi_evento' ,tokenCheck, aggiungi_evento, (req:Request,res:Response)=>{
    res.json(req.body)
})

info_router.delete('/rimuovi_evento/:id' ,tokenCheck, rimuovi_evento, (req:Request,res:Response)=>{
    res.json(req.body)
})

info_router.get('/eventi' , get_all_eventi, (req:Request,res:Response)=>{
    res.json(req.body)
})


