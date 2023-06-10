import {Router} from 'express'
import { tokenCheck } from '../services/token_checker'
import { read_my_recensioni, read_recensioni, scrivi_recensione } from '../controllers/controller_recensione'
export const recensioni_router = Router()

recensioni_router.post('/recensioni' ,tokenCheck, scrivi_recensione)

recensioni_router.get('/recensioni_associato/:id' ,tokenCheck, read_recensioni)

recensioni_router.get('/le_mie_recensioni' ,tokenCheck, read_my_recensioni)