import {Router} from 'express'
import { tokenCheck } from '../services/token_checker'
import { inserisci_prodotto,rimuovi_prodotto,get_prodotti,checkout, checkout_success, checkout_failed } from '../controllers/controller_prodotti'


export const prodotti_router = Router()
prodotti_router.post('/prodotto/inserisci' ,tokenCheck, inserisci_prodotto)

prodotti_router.delete('/prodotto/rimuovi/:id' ,tokenCheck, rimuovi_prodotto)

prodotti_router.get('/catalogo_prodotti' ,get_prodotti)

prodotti_router.post('/prodotto/checkout/:id' ,tokenCheck, checkout)

prodotti_router.post('/prodotto/checkout_success/:id' ,checkout_success)

prodotti_router.post('/prodotto/checkout_failed/:id', checkout_failed)


