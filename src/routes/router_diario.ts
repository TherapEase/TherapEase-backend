import { Router} from 'express'
import { tokenCheck } from '../services/token_checker'
import { elimina_pagina, leggi_diario_cliente, leggi_my_diario, modifica_pagina, scrivi_pagina } from '../controllers/controller_diario'
export const diario_router = Router()

diario_router.post('/crea_pagina', tokenCheck, scrivi_pagina)

diario_router.get('/leggi_pagine', tokenCheck, leggi_my_diario)

diario_router.get('/leggi_pagine/:id', tokenCheck, leggi_diario_cliente)

diario_router.post('/modifica_pagina', tokenCheck, modifica_pagina)

diario_router.post('/elimina_pagina', tokenCheck, elimina_pagina)