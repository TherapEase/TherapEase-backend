import {Router, Request,Response,NextFunction} from 'express'
import { tokenCheck } from '../controllers/token_checker'
import { get_all_terapeuti,get_my_profilo, modify_profilo,get_profilo, get_all_clienti, delete_profilo } from '../controllers/controller_profilo'

export const profilo_router = Router()

profilo_router.get('/catalogo_terapeuti', get_all_terapeuti ,(req:Request,res:Response)=>{
    res.json(req.body)
})

profilo_router.get('/il_mio_profilo',tokenCheck, get_my_profilo, (req:Request,res:Response)=>{
    res.json(req.body)
})

profilo_router.post('/il_mio_profilo/modifica',tokenCheck, modify_profilo, (req:Request,res:Response)=>{
    res.json(req.body)
})

profilo_router.delete('/il_mio_profilo/elimina',tokenCheck,(req:Request,res:Response,next:NextFunction)=>{
    req.params.id=req.body.loggedUser._id
    next()
},delete_profilo,(req:Request,res:Response)=>{
    res.json(req.body)
})

profilo_router.get('/profilo/:id',tokenCheck,get_profilo,(req:Request,res:Response)=>{
    res.json(req.body)
})

profilo_router.delete('/profilo/:id/elimina',tokenCheck,delete_profilo,(req:Request,res:Response)=>{
    res.json(req.body)
})

profilo_router.get('/catalogo_clienti', get_all_clienti ,(req:Request,res:Response)=>{
    res.json(req.body)
})