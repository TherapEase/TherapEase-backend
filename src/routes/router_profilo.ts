import {Router} from 'express'
import { tokenCheck } from '../services/token_checker'
import { get_all_terapeuti,get_my_profilo, modify_profilo,get_profilo, get_all_clienti, delete_profilo } from '../controllers/controller_profilo'

export const profilo_router = Router()

profilo_router.get('/catalogo_terapeuti', get_all_terapeuti)

profilo_router.get('/il_mio_profilo',tokenCheck, get_my_profilo)

profilo_router.post('/il_mio_profilo/modifica',tokenCheck, modify_profilo)

profilo_router.get('/profilo/:id',tokenCheck,get_profilo)

profilo_router.delete('/profilo/:id/elimina',tokenCheck, delete_profilo)

profilo_router.get('/catalogo_clienti',tokenCheck,get_all_clienti)
