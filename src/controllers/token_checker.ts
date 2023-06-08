import {Request,Response,NextFunction} from 'express'
import jwt, { JwtPayload } from 'jsonwebtoken'
import { isBlacklisted } from './controller_logout'
import mongoose from 'mongoose'
import {Utente} from '../schemas/utente_schema'

export async function tokenCheck(req:Request,res:Response,next:NextFunction) {
    //controllare esistenza utente e che ruolo sia valido
    try{
        await mongoose.connect(process.env.DB_CONNECTION_STRING)
        const token = req.body.token || req.query.token || req.headers['x-access-token']
        if(!token){
            return res.status(400).json({
                status:400,
                successful:false,
                message:'No token provided!'
            })
        }
        if(await isBlacklisted(token)){
            return res.status(403).json({
                successful:false,
                message:"Invalid token provided!"
            })
        }
        const decoded = jwt.verify(token, process.env.TOKEN_SECRET) as JwtPayload
        if(!decoded) return res.status(403).json({
            successful:false,
            message: "Verification of token failed!"
        })
        else{
            let utente=await Utente.findById(decoded._id)
            if(!utente){
                return res.status(403).json({
                    successful:false,
                    message:"User does not exist!"
                })
            }
            else if(utente.ruolo!=decoded.ruolo){
                //errore di ruolo non valido
                return res.status(403).json({
                    successful:false,
                    message:"Roles not matching!"
                })
            }
            req.body.loggedUser=decoded
            next()
        }
    } catch (error) {
        return res.status(500).json({
            successful:false,
            message: "Server error in checking token - failed!"
        })
    }
}
