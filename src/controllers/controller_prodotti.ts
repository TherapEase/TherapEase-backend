import { Request,Response,NextFunction } from 'express'
import mongoose from 'mongoose'
import { IProdotto, Prodotto } from '../schemas/prodotto_schema'
import { Cliente } from '../schemas/cliente_schema'

export async function inserisci_prodotto(req:Request,res:Response,next:NextFunction){
    
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
    const nome=req.body.nome
    const prezzo=req.body.prezzo
    const n_gettoni=req.body.n_gettoni
    if(!nome || !prezzo || !n_gettoni){
        res.status(400)
        req.body={
            successful: false,
            message: "Not enough arguments!"
        }
        next()
        return
    }

    try{
        // controllo se esiste già
        await mongoose.connect(process.env.DB_CONNECTION_STRING)
        let esistente = await Prodotto.findOne({nome:nome, n_gettoni:n_gettoni, prezzo:prezzo}).exec()
        if(esistente){
            res.status(409)
            req.body={
                successful: false,
                message: "Product already present!"
            }
            next()
            return 
        }else{
            const schema_prodotto= new Prodotto<IProdotto>({
                nome:nome,
                prezzo:prezzo,
                n_gettoni:n_gettoni
            });
            await schema_prodotto.save();
            res.status(200)
            req.body={
                successful: true,
                message: "Product successfully inserted!"
            }
            next()
            return
        }

    }catch(err){
        res.status(500)
        req.body={
            successful: false,
            message: "Server error in product creation - failed!"
        }
        next()
        return 
    }

};

export async function rimuovi_prodotto(req:Request,res:Response,next:NextFunction){
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

    try{
        // controllo presenza prodotto
        await mongoose.connect(process.env.DB_CONNECTION_STRING)
        let presente= await Prodotto.findOneAndDelete({_id:req.params.id}).exec()
        if(!presente){
            res.status(409)
            req.body={
                successful: false,
                message: "Element doesn’t exist or can’t be removed!"
            }
            next()
            return 
        }else{
            res.status(200)
            req.body={
                successful: true,
                message: "Product successfully deleted!"
            }
            next()
            return 
        }
    }catch(err){
        res.status(500)
        req.body={
            successful: false,
            message: "Server error in product removal - failed!"
        }
        next()
        return 
    }
   


};

export async function get_prodotti(req:Request,res:Response,next:NextFunction){
    try {
        await mongoose.connect(process.env.DB_CONNECTION_STRING)
        // console.log("dbconnesso")
        const catalogo_prodotti=await Prodotto.find({}).exec()
        // console.log(catalogo_terapeuti)
        res.status(200)
        req.body={
            successful:true,
            message:"Product catalog retrieved successfully!",
            catalogo: catalogo_prodotti
        }
    } catch (err) {
        res.status(500)
        req.body={
            successful:false,
            message:"Server error in product catalog - failed!"
        }
    }
    next()
};

export async function aggiungi_gettoni(id_cliente:string, n_gettoni:Number) {
    await mongoose.connect(process.env.DB_CONNECTION_STRING)
    let cliente= await Cliente.findById(id_cliente).exec()
    let new_gettoni=(cliente.n_gettoni as number)+ (n_gettoni as number)
    await Cliente.findOneAndUpdate({_id:id_cliente},{n_gettoni:new_gettoni}).exec()
}

export async function checkout(req:Request,res:Response,next:NextFunction){
    
    // controllo ruolo
    if(req.body.loggedUser.ruolo!=1){
        res.status(403)
        req.body={
            successful: false,
            message: "Request denied!"
        }
        next()
        return 
    }
    
    try {
        // controllo presenza prodotto
        await mongoose.connect(process.env.DB_CONNECTION_STRING)
        let presente= await Prodotto.findById(req.params.id).exec()
        if(!presente){
            res.status(409)
            req.body={
                successful: false,
                message: "Element doesn’t exist or can’t be removed!"
            }
            next()
            return 
        }

        const stripe = require('stripe')(process.env.SK_STRIPE);
        console.log("stripe begin")
        const session=await stripe.checkout.sessions.create({
            payment_method_types:['card'],
            mode: 'payment', //one time payment
            line_items: [{
                price_data:{
                    currency: 'eur',
                    product_data: {
                        name: presente.nome,
                    }, 
                    unit_amount: presente.prezzo*100, // in cents
                },
                quantity: 1,
            }],
            success_url: "http://localhost:3001/prodotto/checkout_success", // to change
            cancel_url: "http://localhost:3001/prodotto/checkout_failed", // to change con una pagina con un messaggio di errore
        })

        res.status(200)
        req.body={
            successful:true,
            url: session.url,
            message:"Successful redirect to checkout!"
        }
        next()
        return
    
    } catch (err) {
        res.status(500)
        req.body={
            successful:false,
            message:"Server error in redirect - failed!"+ err
        }
        next()
        return
    }

};


// E' L'INSICUREZZA FATTA A FUNZIONE MA NON SO COME ALTRO FARE
export async function checkout_success(req:Request,res:Response,next:NextFunction){
    
    // controllo ruolo
    if(req.body.loggedUser.ruolo!=1){
        res.status(403)
        req.body={
            successful: false,
            message: "Request denied!"
        }
        next()
        return 
    }
    
    try {
        // controllo presenza prodotto
        await mongoose.connect(process.env.DB_CONNECTION_STRING)
        let presente= await Prodotto.findById(req.params.id).exec()
        if(!presente){
            res.status(409)
            req.body={
                successful: false,
                message: "Element doesn’t exist or can’t be removed!"
            }
            next()
            return 
        }

        aggiungi_gettoni(req.body.loggedUser._id, presente.n_gettoni)
    
    } catch (err) {
        res.status(500)
        req.body={
            successful:false,
            message:"Server error in redirect - failed!"+ err
        }
        next()
        return
    }
};


// FA SCHIFO, PROBABILMENTE SI PUO' FARE TUTTA DI FRONT DIRETTAMENTE
export async function checkout_failed(req:Request,res:Response,next:NextFunction){
    console.log("Checkout failed!")
};