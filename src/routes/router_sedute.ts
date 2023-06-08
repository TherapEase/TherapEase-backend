import {Router} from 'express'
import { tokenCheck } from '../controllers/token_checker'
import { crea_slot_seduta,elimina_slot_seduta,prenota_seduta,mostra_calendario_completo,mostra_calendario_disponibili,mostra_calendario_prenotate, annulla_prenotazione_seduta } from '../controllers/controller_sedute'
export const sedute_router = Router()

sedute_router.post('/definisci_slot', tokenCheck, crea_slot_seduta)

sedute_router.post('/definisci_slot/elimina', tokenCheck, elimina_slot_seduta)

sedute_router.post('/prenotazione', tokenCheck, prenota_seduta)

sedute_router.get('/calendario',tokenCheck, mostra_calendario_completo,)

sedute_router.get('/calendario/disponibili',tokenCheck, mostra_calendario_disponibili)

sedute_router.get('/calendario/prenotate',tokenCheck, mostra_calendario_prenotate)

sedute_router.post('/annullaprenotazione', tokenCheck, annulla_prenotazione_seduta)