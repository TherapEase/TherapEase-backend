import { json } from 'body-parser';
import {Router,Request,Response,NextFunction} from 'express'
import { registrazione , login, get_my_profilo,modify_profilo,get_profilo, get_all_terapeuti} from '../controllers/controller_utente';
import { associazione,rimuovi_associazione } from '../controllers/controller_utente';
import { crea_slot_seduta, elimina_slot_seduta, prenota_seduta, mostra_calendario_completo, mostra_calendario_disponibili, mostra_calendario_prenotate} from '../controllers/controller_sedute';
import { tokenCheck } from '../controllers/token_checker';
import { logout } from '../controllers/controller_logout';
import { send_mail } from '../controllers/gmail_connector';
import { cambio_password, recupero_password } from '../controllers/controller_password';
import { inserisci_prodotto, rimuovi_prodotto, get_prodotti, acquisto } from '../controllers/controller_prodotti';
//import cors from 'cors';

export const defaultRoute = Router()

defaultRoute.get('/',(req,res)=>{
    res.send("sono nel router");
})

defaultRoute.use('/test',(req:Request,res:Response)=>{
    res.json(req.body)
})
defaultRoute.post('/registrazione',registrazione,async (req:Request,res:Response)=>{
    res.json(req.body)
})
defaultRoute.post('/login', login ,(req:Request,res:Response)=>{
    res.json(req.body)
})

defaultRoute.get('/catalogo_terapeuti', get_all_terapeuti ,(req:Request,res:Response)=>{
    res.json(req.body)
})

defaultRoute.use('/authexample',tokenCheck,(req:Request,res:Response)=>{
    res.status(200).json({
        successful:true,
        message: "token verification ok",
        loggedUser: req.body.loggedUser,
    })
})

defaultRoute.get('/il_mio_profilo',tokenCheck, get_my_profilo, (req:Request,res:Response)=>{
    res.json(req.body)
})

defaultRoute.post('/il_mio_profilo/modifica',tokenCheck, modify_profilo, (req:Request,res:Response)=>{
    res.json(req.body)
})

defaultRoute.get('/profilo/:id',tokenCheck,get_profilo,(req:Request,res:Response)=>{
    res.json(req.body)
})

defaultRoute.get('/logout',tokenCheck,logout,(req:Request,res:Response)=>{
    res.json(req.body)
})
defaultRoute.get('/associazione/:id',tokenCheck, associazione,(req:Request,res:Response)=>{
    res.json(req.body)
})
defaultRoute.get('/associazione/rimuovi/:id',tokenCheck,rimuovi_associazione,(req:Request,res:Response)=>{
    res.json(req.body)
})
defaultRoute.post('/definisci_slot', tokenCheck, crea_slot_seduta,(req:Request,res:Response)=>{
    res.json(req.body)
})

defaultRoute.post('/definisci_slot/elimina', tokenCheck, elimina_slot_seduta,(req:Request,res:Response)=>{
    res.json(req.body)
})

defaultRoute.post('/prenotazione', tokenCheck, prenota_seduta,(req:Request,res:Response)=>{
    res.json(req.body)
})

defaultRoute.get('/calendario',tokenCheck, mostra_calendario_completo,(req:Request,res:Response)=>{
    res.json(req.body)
})

defaultRoute.get('/calendario/disponibili',tokenCheck, mostra_calendario_disponibili,(req:Request,res:Response)=>{
    res.json(req.body)
})

defaultRoute.get('/calendario/prenotate',tokenCheck, mostra_calendario_prenotate,(req:Request,res:Response)=>{
    res.json(req.body)
})

defaultRoute.post('/recuperopassword',recupero_password, (req:Request,res:Response)=>{
    res.json(req.body)
})

defaultRoute.post('/cambio_password',tokenCheck, cambio_password, (req:Request,res:Response)=>{
    res.json(req.body)
})

defaultRoute.post('/prodotto/inserisci' ,tokenCheck, inserisci_prodotto, (req:Request,res:Response)=>{
    res.json(req.body)
})

defaultRoute.get('/prodotto/rimuovi/:id' ,tokenCheck, rimuovi_prodotto, (req:Request,res:Response)=>{
    res.json(req.body)
})

defaultRoute.get('/catalogo_prodotti' ,get_prodotti, (req:Request,res:Response)=>{
    res.json(req.body)
})

defaultRoute.get('/prodotto/acquisto/:id' ,tokenCheck, acquisto, (req:Request,res:Response)=>{
    res.json(req.body)
})
