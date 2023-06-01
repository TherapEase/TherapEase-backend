import {Router, Response, Request, NextFunction} from 'express'
import { tokenCheck } from '../controllers/token_checker'
import { inserisci_prodotto,rimuovi_prodotto,get_prodotti,checkout } from '../controllers/controller_prodotti'


export const prodotti_router = Router()
prodotti_router.post('/prodotto/inserisci' ,tokenCheck, inserisci_prodotto, (req:Request,res:Response)=>{
    res.json(req.body)
})

prodotti_router.get('/prodotto/rimuovi/:id' ,tokenCheck, rimuovi_prodotto, (req:Request,res:Response)=>{
    res.json(req.body)
})

prodotti_router.get('/catalogo_prodotti' ,get_prodotti, (req:Request,res:Response)=>{
    res.json(req.body)
})

prodotti_router.get('/prodotto/checkout/:id' ,tokenCheck, checkout, (req:Request,res:Response)=>{
    res.json(req.body)
})