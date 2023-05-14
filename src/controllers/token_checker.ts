import {Request,Response,NextFunction} from 'express'
import jwt, { JwtPayload } from 'jsonwebtoken'
import dotenv from 'dotenv'

export function tokenCheck(req:Request,res:Response,next:NextFunction) {
    
    try{
        const token = req.body.token || req.query.token || req.headers['x-access-token']
        if(!token){
            return res.status(400).json({
                status:400,
                successful:false,
                message:'No token provided'
            })
        }

        const decoded = jwt.verify(token, process.env.TOKEN_SECRET)
        if(!decoded) return res.status(500).json({
            status:500,
            successful:false,
            message: "Failed token verification"
        })
        else{
            req.body.loggedUser=decoded
            next()
        }
    } catch (error) {
        return res.status(500).json({
            status:500,
            successful:false,
            message: "Internal Error: " + error
        })
    }
}