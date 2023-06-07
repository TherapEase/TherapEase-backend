import {Router,Request,Response,NextFunction} from 'express'
import { auth_router } from './router_auth';
import { profilo_router } from './router_profilo';
import { sedute_router } from './router_sedute';
import { associazione_router } from './router_associazione';
import { prodotti_router } from './router_prodotti';
import { segnalazioni_router } from './router_segnalazioni';
import { recensioni_router } from './router_recensioni';
import { diario_router } from './router_diario';
import { info_router } from './router_info_eventi';

//import cors from 'cors';

export const defaultRoute = Router()
export const defret= (req:Request,res:Response)=>{res.json(req.body)}

defaultRoute.use('/',auth_router,profilo_router,sedute_router,associazione_router,prodotti_router, segnalazioni_router, recensioni_router, diario_router, info_router)


defaultRoute.use('/test', defret)

defaultRoute.use('/', (req:Request,res:Response)=>{
    res.status(404).json({
        successful:false,
        message:"Not Found"
    })
})







