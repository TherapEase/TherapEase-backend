import {Request,Response,NextFunction} from 'express'
import jwt, { JwtPayload } from 'jsonwebtoken'
import dotenv from 'dotenv'
import { isBlacklisted } from './controller_logout'

export async function tokenCheck(req:Request,res:Response,next:NextFunction) {
    
    try{
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
        const decoded = jwt.verify(token, process.env.TOKEN_SECRET)
        if(!decoded) return res.status(403).json({
            successful:false,
            message: "Verification of token failed!"
        })
        else{
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
