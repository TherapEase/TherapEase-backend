import {Router} from 'express'
import { registrazione, login, conferma_mail } from '../controllers/controller_auth'
import { tokenCheck } from '../services/token_checker'
import { logout } from '../controllers/controller_logout'
import { recupero_password, cambio_password } from '../controllers/controller_password'

export const auth_router = Router()

auth_router.post('/registrazione',registrazione)

auth_router.post('/login', login)

auth_router.delete('/logout',tokenCheck,logout)

auth_router.post('/recuperopassword',recupero_password)

auth_router.post('/cambio_password',tokenCheck, cambio_password)

auth_router.post('/conferma_mail/:ver_token',conferma_mail)