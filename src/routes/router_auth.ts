import {Router, Request, Response, NextFunction} from 'express'

import { registrazione, login, conferma_mail } from '../controllers/controller_auth'
import { tokenCheck } from '../controllers/token_checker'
import { logout } from '../controllers/controller_logout'
import { recupero_password, cambio_password } from '../controllers/controller_password'

export const auth_router = Router()

auth_router.post('/registrazione',registrazione,async (req:Request,res:Response)=>{
    res.json(req.body)
})

auth_router.post('/login', login ,(req:Request,res:Response)=>{
    res.json(req.body)
})

auth_router.post('/logout',tokenCheck,logout,(req:Request,res:Response)=>{
    res.json(req.body)
})

auth_router.post('/recuperopassword',recupero_password, (req:Request,res:Response)=>{
    res.json(req.body)
})

auth_router.post('/cambio_password',tokenCheck, cambio_password, (req:Request,res:Response)=>{
    res.json(req.body)
})

auth_router.get('/conferma_mail/:ver_token',conferma_mail,(req:Request,res:Response)=>{
    res.json(req.body)
})