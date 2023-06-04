import { Request,Response, NextFunction } from "express";
import mongoose from "mongoose";
import { IInfo, Info } from "../schemas/info_eventi_schema";


export async function aggiungi_evento(req:Request,res:Response,next:NextFunction) {
    
    // controllo ruolo
    if(req.body.loggedUser.ruolo!=4){
        res.status(403)
        req.body={
            successful: false,
            message: "Request denied!"
        }
        next()
        return 
    }

    // controllo presenza campi
    const data= req.body.data
    const foto= req.body.foto
    const testo=req.body.testo
    if(!data || !testo){
        res.status(400)
        req.body={
            successful: false,
            message: "Not enough arguments!"
        }
        next()
        return
    }

    try {
        mongoose.connect(process.env.DB_CONNECTION_STRING)

        let schema_info;
        if(!data){
            schema_info=new Info<IInfo>({
                testo: testo,
                data: data,
                foto: ""
            })
        }else{
            schema_info=new Info<IInfo>({
                testo: testo,
                data: data,
                foto: foto
            })
        }

        await Info.create(schema_info)


        res.status(200)
        req.body={
            successful:true,
            message:"Event successfully added!"
        }
        next()

    } catch (error) {
        res.status(500)
        req.body={
            successful:false,
            message:"Server error in adding event - failed!"
        }
        next()
    }

}

export async function rimuovi_evento(req:Request,res:Response,next:NextFunction) {
    
    // controllo ruolo
    if(req.body.loggedUser.ruolo!=4){
        res.status(403)
        req.body={
            successful: false,
            message: "Request denied!"
        }
        next()
        return 
    }

    try {
        mongoose.connect(process.env.DB_CONNECTION_STRING)



        res.status(200)
        req.body={
            successful:true,
            message:"Event successfully added!"
        }
        next()

    } catch (error) {
        res.status(500)
        req.body={
            successful:false,
            message:"Server error in logout - failed!"
        }
        next()
    }

}