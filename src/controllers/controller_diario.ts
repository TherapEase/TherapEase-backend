import { Request,Response,NextFunction } from 'express'
import {Pagina, IPagina} from '../schemas/pagina_schema'
import mongoose from 'mongoose'



export async function scrivi_pagina(req:Request, res: Response, next: NextFunction) {
    //controllo accesso: solo il cliente può scrivere
    if(req.body.loggedUser.ruolo!=1){
        res.status(403)
        req.body={
            successful: false,
            message: "Request denied!"
        }
        next()
        return
    }

    //controllo campi: data: Date e testo: string
    const data=req.body.data
    const testo=req.body.testo

    if(!data || !testo){
        res.status(400)
        req.body={
            successful:false,
            message: "Not enough arguments!"
        }

        next()
        return
    }
    //controllo data: la pagina non può essere di un giorno futuro
    else if(new Date(data).getTime() >Date.now()){
        
        res.status(400)
        req.body={
            successful: false,
            message: "Cannot create page in the future!"
        }
        next()
        return
    }
    try{
        await mongoose.connect(process.env.DB_CONNECTION_STRING)
        //controllo che non sia già presente una pagina quel giorno
        let pagina_presente= await Pagina.findOne({data:data, cliente:req.body.loggedUser._id}).exec()
        console.log(pagina_presente)
        if(!pagina_presente){
            let pagina_schema= new Pagina<IPagina>({
                cliente:req.body.loggedUser._id,
                data: data,
                testo: testo,
            })
            await pagina_schema.save()
        }
        res.status(200)
        req.body={
            successful:true,
            message: "Page successfully created!"
        }
        next()
        return

    }catch(err){
        res.status(500)
        req.body={
            successful: false,
            message: "Server error in page creation - failed"
        }
    }
}


export async function leggi_pagine(req: Request, res: Response, next: NextFunction){

}