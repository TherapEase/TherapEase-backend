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

export async function acquisto(req:Request,res:Response,next:NextFunction){
    
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

        // creazione clienteStripe se non è già presente
        const stripe = require('stripe')(process.env.SK_STRIPE);
        let cliente= await Cliente.findOne({_id:req.body.loggedUser._id}).exec()
        if(cliente.stripeCustomerId==""){
            const customer= await stripe.customers.create({
                email: "annachiarafortuna01@gmail.com",//cliente.email as string, //serve sempre una mail valida
                name: cliente.nome
            })
            console.log(customer)
            cliente= await Cliente.findOneAndUpdate({_id:req.body.loggedUser._id}, {stripeCustomerId:customer.id}, {new:true}).exec()
            console.log(cliente)
        }
   
        // pagamento
        await stripe.paymentIntents.create({
            amount: presente.prezzo*100, //in centesimi
            currency: 'eur',
            customer: cliente.stripeCustomerId,
            payment_method: 'pm_card_visa'
        });
        res.status(200)
        req.body={
            successful:true,
            message:"Successful payment"
        }
        next()
        return
    
    } catch (err) {
        res.status(500)
        req.body={
            successful:false,
            message:"Server error in buying product - failed!"+ err
        }
        next()
        return
    }

};