import {Router} from 'express'
//import cors from 'cors';

export const defaultRoute = Router()

defaultRoute.get('/',(req,res)=>{
    res.send("sono nel router");
})
defaultRoute.use('/test',(req,res)=>{
    res.json({test:"successful"})
})

// export = (()=>{
//     let router = express.Router()
//     // const options: cors.CorsOptions={
//     //     allowedHeaders:[
//     //         'Origin',
//     //         'X-Requested-With',
//     //         'Content-Type',
//     //         'Accept',
//     //         'X-Access-Token'
//     //     ],
//     //     credentials:true,
//     // };
    
//     // router.use(cors(options));

//      router.use('/test',(req,res)=>{
//         console.log("dentro il router")
//         res.send("test!!!")
//      })
// })
