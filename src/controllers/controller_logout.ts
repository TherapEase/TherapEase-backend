import { Request,Response, NextFunction } from "express";
import mongoose from "mongoose";
import jwt, { JwtPayload } from 'jsonwebtoken'
import dotenv from 'dotenv'
import { JWTToken } from "../schemas/token_schema";

/**
 * 
 * Nel front bisogna eliminare il token dal client 
 */



export async function logout(req:Request,res:Response,next:NextFunction) {
    const token = req.body.token || req.query.token || req.headers['x-access-token']
    try {
        mongoose.connect(process.env.DB_CONNECTION_STRING)
        const decoded = jwt.verify(token,process.env.TOKEN_SECRET)
        //aggiungo il token alla lista nera

        let blacklisted = new JWTToken({
            token:token,
            expiration: (decoded as JwtPayload).exp
        })
        await blacklisted.save()

        res.status(200)
        req.body={
            successful:true,
            message:"logged out"
        }
        next()

    } catch (error) {
        res.status(500)
        req.body={
            successful:false,
            message:"Internal logout error: "+error
        }
        next()
    }

}

export async function blacklist_cleaner() {
    try {
        await mongoose.connect(process.env.DB_CONNECTION_STRING)
        await JWTToken.deleteMany({expiration:{$lt:Date.now()}}).exec()
    } catch (error) {
        throw error
    }
}

export async function isBlacklisted(token:string){
    await mongoose.connect(process.env.DB_CONNECTION_STRING)
    let found = await JWTToken.find({token:token}).exec()
    return found.length
}