import {Router} from 'express'
import { tokenCheck } from '../services/token_checker'
import { gestisci_segnalazione, get_all_segnalazioni, segnala } from '../controllers/controller_segnalazione';


export const segnalazioni_router = Router()

segnalazioni_router.post('/segnalazione/:id' ,tokenCheck, segnala)

segnalazioni_router.get('/catalogo_segnalazioni',tokenCheck, get_all_segnalazioni)

segnalazioni_router.post('/segnalazione/gestisci/:id' ,tokenCheck, gestisci_segnalazione)