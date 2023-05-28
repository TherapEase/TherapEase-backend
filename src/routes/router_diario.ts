import { Router, Request, Response, NextFunction } from 'express'
import { tokenCheck } from '../controllers/token_checker'
import { elimina_pagina, leggi_diario_cliente, leggi_my_diario, modifica_pagina, scrivi_pagina } from '../controllers/controller_diario'
export const diario_router = Router()

diario_router.post('/crea_pagina', tokenCheck, scrivi_pagina, (req: Request, res: Response) => {
    res.json(req.body)
})

diario_router.get('/leggi_pagine', tokenCheck, leggi_my_diario, (req: Request, res: Response) => {
        res.json(req.body)
})

diario_router.get('/leggi_pagine/:id', tokenCheck, leggi_diario_cliente, (req: Request, res: Response) => {
    res.json(req.body)
})

diario_router.post('/modifica_pagina', tokenCheck, modifica_pagina, (req: Request, res: Response) => {
    res.json(req.body)
})

diario_router.post('/elimina_pagina', tokenCheck, elimina_pagina, (req: Request, res: Response) => {
    res.json(req.body)
})