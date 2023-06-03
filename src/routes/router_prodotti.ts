import {Router, Response, Request, NextFunction} from 'express'
import { tokenCheck } from '../controllers/token_checker'
import { inserisci_prodotto,rimuovi_prodotto,get_prodotti,checkout, checkout_success, checkout_failed } from '../controllers/controller_prodotti'


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

prodotti_router.get('/prodotto/checkout_success/:id' ,checkout_success, (req:Request,res:Response)=>{
    res.end(`<h1>Operazione avvenuta con successo</h1>
    <a href="http://localhost:8080/dashboard">Torna alla Home</a>
                `)
    //res.json(req.body)
})

prodotti_router.get('/prodotto/checkout_failed', checkout_failed, (req:Request,res:Response)=>{
    res.end(`<h1>Operazione NON avvenuta con successo</h1>
    <a href="http://localhost:8080/dashboard">Torna alla Home</a>
                `)
})



