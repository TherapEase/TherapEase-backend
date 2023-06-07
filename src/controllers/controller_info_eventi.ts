import { Request,Response, NextFunction } from "express";
import mongoose from "mongoose";
import { IInfo, Info } from "../schemas/info_eventi_schema";


export async function aggiungi_evento(req:Request,res:Response) {
    
    // controllo ruolo
    if(req.body.loggedUser.ruolo!=4){
        res.status(403).json({
            successful: false,
            message: "Request denied!"
        })
    }

    // controllo presenza campi
    const data= req.body.data
    const foto= req.body.foto
    const testo=req.body.testo
    const titolo=req.body.titolo
    if(!data || !testo || !titolo){
        res.status(400).json({
            successful: false,
            message: "Not enough arguments!"
        })
    }

    // controllo che la data sia nel futuro
    if(new Date(data).getTime() <=Date.now()){
        res.status(409).json({
            successful:false,
            message:"Cannot add an event in the past!"
        }) 
    }

    try {
        await mongoose.connect(process.env.DB_CONNECTION_STRING)

        // controllo evento gia presente
        const presente=await Info.findOne({data:data, titolo: titolo, testo:testo})
        if(!presente){
            let schema_info;
            if(!foto){
                schema_info=new Info<IInfo>({
                    testo: testo,
                    data: data,
                    foto: "",
                    titolo: titolo
                })
            }else{
                schema_info=new Info<IInfo>({
                    testo: testo,
                    data: data,
                    foto: foto,
                    titolo: titolo
                })
            }
    
            await Info.create(schema_info)
    
            res.status(200).json({
                successful:true,
                message:"Event successfully added!"
            })
        }else{
            res.status(409).json({
                successful:false,
                message:"Event already present!"
            })
        }
    } catch (error) {
        res.status(500).json({
            successful:false,
            message:"Server error in adding event - failed! "+ error
        })
    }
}

export async function rimuovi_evento(req:Request,res:Response) {
    
    // controllo ruolo
    if(req.body.loggedUser.ruolo!=4){
        res.status(403).json({
            successful: false,
            message: "Request denied!"
        })
    }

    try {
        await mongoose.connect(process.env.DB_CONNECTION_STRING)
        await Info.findByIdAndDelete(req.params.id)

        res.status(200).json({
            successful:true,
            message:"Event successfully deleted or not present!"
        })
    } catch (error) {
        res.status(500).json({
            successful:false,
            message:"Server error in event elimination - failed!"
        })
    }
}

export async function get_all_eventi(req:Request,res:Response) {
    try {
        await mongoose.connect(process.env.DB_CONNECTION_STRING)
        const eventi=await Info.find()

        res.status(200).json({
            successful:true,
            eventi:eventi,
            message:"Event successfully deleted or not present!"
        })
    } catch (error) {
        res.status(500).json({
            successful:false,
            message:"Server error in showing events - failed!"
        })
    }
}