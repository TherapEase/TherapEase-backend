import {Router, Request, Response, NextFunction} from 'express'
import { tokenCheck } from '../controllers/token_checker'
import { read_my_recensioni, read_recensioni, scrivi_recensione } from '../controllers/controller_recensione'
export const recensioni_router = Router()

recensioni_router.post('/recensioni' ,tokenCheck, scrivi_recensione, (req:Request,res:Response)=>{
    res.json(req.body)
})

recensioni_router.get('/recensioni_associato/:id' ,tokenCheck, read_recensioni, (req:Request,res:Response)=>{
    res.json(req.body)
})

recensioni_router.get('/le_mie_recensioni' ,tokenCheck, read_my_recensioni, (req:Request,res:Response)=>{
    res.json(req.body)
})