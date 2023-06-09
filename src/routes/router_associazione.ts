import {Router} from 'express'
import { tokenCheck } from '../services/token_checker'
import { get_all_associati,associazione,rimuovi_associazione } from '../controllers/controller_associazione'

export const associazione_router = Router()


associazione_router.get('/catalogo_associati', tokenCheck, get_all_associati)


associazione_router.post('/associazione/:id',tokenCheck, associazione)


associazione_router.delete('/associazione/rimuovi/:id', tokenCheck, rimuovi_associazione)

