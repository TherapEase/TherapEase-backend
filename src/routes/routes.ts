import {Router,Request,Response,NextFunction} from 'express'
import { auth_router } from './router_auth';
import { profilo_router } from './router_profilo';
import { sedute_router } from './router_sedute';
import { associazione_router } from './router_associazione';
import { prodotti_router } from './router_prodotti';
//import cors from 'cors';

export const defaultRoute = Router()

defaultRoute.use('/',auth_router,profilo_router,sedute_router,associazione_router,prodotti_router)

defaultRoute.use('/test',(req:Request,res:Response)=>{
    res.json(req.body)
})

defaultRoute.use('/', (req:Request,res:Response)=>{
    res.status(404).json({
        successful:false,
        message:"Not Found"
    })
})







