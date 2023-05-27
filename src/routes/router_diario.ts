import {Router, Request, Response, NextFunction} from 'express'
import { tokenCheck } from '../controllers/token_checker'
import { leggi_pagine, scrivi_pagina } from '../controllers/controller_diario'
export const diario_router = Router()

diario_router.post('/crea_pagina', tokenCheck, scrivi_pagina,(req:Request,res:Response)=>{
    res.json(req.body)
})

diario_router.get('/leggi_pagine', tokenCheck, leggi_pagine
,(req:Request,res:Response)=>{
    res.json(req.body)
})