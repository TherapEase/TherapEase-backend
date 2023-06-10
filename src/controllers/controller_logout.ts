import { Request,Response} from "express";
import jwt, { JwtPayload } from 'jsonwebtoken'
import { JWTToken } from "../schemas/token_schema";

export async function logout(req:Request,res:Response) {
    const token = req.body.token || req.query.token || req.headers['x-access-token']
    try {
        const decoded = jwt.verify(token,process.env.TOKEN_SECRET)
        
        //aggiungo il token alla lista nera
        let blacklisted = new JWTToken({
            token:token,
            expiration: (decoded as JwtPayload).exp
        })
        await blacklisted.save()

        res.status(200).json({
            successful:true,
            message:"Logout successfully executed!"
        })
        return

    } catch (error) {
        res.status(500).json({
            successful:false,
            message:"Server error in logout - failed!"
        })
        return

    }
}

export async function blacklist_cleaner() {
    try {
        await JWTToken.deleteMany({expiration:{$lt:Date.now()}}).exec()
    } catch (error) {
        throw error
    }
}

export async function isBlacklisted(token:string){
    let found = await JWTToken.find({token:token}).exec()
    return found.length
}