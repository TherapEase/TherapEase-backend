import {Router} from 'express'
import { tokenCheck } from '../services/token_checker'
import { aggiungi_evento, get_all_eventi, rimuovi_evento } from '../controllers/controller_info_eventi'



export const info_router= Router()
info_router.post('/aggiungi_evento' ,tokenCheck, aggiungi_evento)

info_router.delete('/rimuovi_evento/:id' ,tokenCheck, rimuovi_evento)

info_router.get('/eventi', get_all_eventi)


