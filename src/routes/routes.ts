import {Router} from 'express'
//import cors from 'cors';

export const defaultRoute = Router()

defaultRoute.get('/',(req,res)=>{
    res.send("sono nel router");
})

defaultRoute.use('/test',(req,res)=>{
    res.json({test:"successful"})
})