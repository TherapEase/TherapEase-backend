import { Request,Response } from 'express'
import { IProdotto, Prodotto } from '../schemas/prodotto_schema'
import { Cliente } from '../schemas/cliente_schema'
import { ISessione, Sessione } from '../schemas/sessione_stripe_schema'

export async function inserisci_prodotto(req:Request,res:Response){
    
    // controllo ruolo
    if(req.body.loggedUser.ruolo!=4){
        res.status(403).json({
            successful: false,
            message: "Request denied!"
        })
        return
    }

    // controllo presenza campi
    const nome=req.body.nome
    const prezzo=req.body.prezzo
    const n_gettoni=req.body.n_gettoni
    if(!nome || !prezzo || !n_gettoni){
        res.status(400).json({
            successful: false,
            message: "Not enough arguments!"
        })
        return
    }

    try{
        // controllo se esiste già
        let esistente = await Prodotto.findOne({nome:nome, n_gettoni:n_gettoni, prezzo:prezzo}).exec()
        if(esistente){
            res.status(409).json({
                successful: false,
                message: "Product already present!"
            })
            return
        }else{
            const schema_prodotto= new Prodotto<IProdotto>({
                nome:nome,
                prezzo:prezzo,
                n_gettoni:n_gettoni
            });
            await Prodotto.create(schema_prodotto)
            res.status(200).json({
                successful: true,
                message: "Product successfully inserted!"
            })
            return
        }

    }catch(err){
        res.status(500).json({
            successful: false,
            message: "Server error in product creation - failed!"
        })
        return
    }
};

export async function rimuovi_prodotto(req:Request,res:Response){
    
    // controllo ruolo
    if(req.body.loggedUser.ruolo!=4){
        res.status(403).json({
            successful: false,
            message: "Request denied!"
        })
        return

    }

    try{
        // controllo presenza prodotto
        let presente= await Prodotto.findOneAndDelete({_id:req.params.id}).exec()
        if(!presente){
            res.status(409).json({
                successful: false,
                message: "Element doesn’t exist or can’t be removed!"
            }) 
        return

        }else{
            res.status(200).json({
                successful: true,
                message: "Product successfully deleted!"
            })
            return
        }
    }catch(err){
        res.status(500).json({
            successful: false,
            message: "Server error in product removal - failed!"
        })
        return
    }
};

export async function get_prodotti(req:Request,res:Response){
    try {
        const catalogo_prodotti=await Prodotto.find({}).exec()
        res.status(200).json({
            successful:true,
            message:"Product catalog retrieved successfully!",
            catalogo: catalogo_prodotti
        })
        return
    } catch (err) {
        res.status(500).json({
            successful:false,
            message:"Server error in product catalog - failed!"
        })
        return
    }
};

export async function aggiungi_gettoni(id_cliente:string, n_gettoni:Number) {
    let cliente= await Cliente.findById(id_cliente).exec()
    let new_gettoni=(cliente.n_gettoni as number)+ (n_gettoni as number)
    await Cliente.findOneAndUpdate({_id:id_cliente},{n_gettoni:new_gettoni}).exec()
}

export async function checkout(req:Request,res:Response){
    
    // controllo ruolo
    if(req.body.loggedUser.ruolo!=1){
        res.status(403).json({
            successful: false,
            message: "Request denied!"
        })
        return
    }
    
    try {
        // controllo presenza prodotto
        let presente= await Prodotto.findById(req.params.id).exec()
        if(!presente){
            res.status(409).json({
                successful: false,
                message: "Element doesn’t exist!"
            })
            return
        }

        const sessione_to_save= new Sessione<ISessione> ({
            n_gettoni: presente.n_gettoni   ,
            id_cliente: req.body.loggedUser._id
        })
        await Sessione.create(sessione_to_save)

        const stripe = require('stripe')(process.env.SK_STRIPE);
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
            success_url: process.env.DEPLOY_BACK+"prodotto/checkout_success/"+sessione_to_save._id,
            cancel_url: process.env.DEPLOY_BACK+"prodotto/checkout_failed/"+sessione_to_save._id,
        })

        res.status(200).json({
            successful:true,
            url: session.url,
            message:"Successful redirect to checkout!"
        })
        return
    } catch (err) {
        res.status(500).json({
            successful:false,
            message:"Server error in redirect - failed!"
        })
        return
    }
}


export async function checkout_success(req:Request,res:Response){
    
    try {
        // controllo presenza prodotto
        let presente= await Sessione.findById(req.params.id).exec()
        if(!presente){
            res.status(409).json({
                successful: false,
                message: "Element doesn’t exist!"
            }).redirect(process.env.DEPLOY_FRONT+"/profilo")
            return
        }

        aggiungi_gettoni(presente.id_cliente, presente.n_gettoni)
        await Sessione.findByIdAndDelete(req.params.id)

        res.status(200).json({
            successful:true,
            message:"Gettoni aggiunti!"
        }).redirect(process.env.DEPLOY_FRONT+"/profilo")
        return
    } catch (err) {
        res.status(500).json({
            successful:false,
            message:"Server error checkout success - failed!"
        })
        return
    }
}


export async function checkout_failed(req:Request,res:Response){
    try {
        // controllo presenza prodotto
        let presente= await Sessione.findById(req.params.id).exec()
        if(!presente){
            res.status(409).json({
                successful: false,
                message: "Element doesn’t exist!"
            }).redirect(process.env.DEPLOY_FRONT+"/profilo")
            return
        }
        await Sessione.findByIdAndDelete(req.params.id)

        res.status(200).json({
            successful:true,
            message:"Successful redirecting after payment failure!"
        }).redirect(process.env.DEPLOY_FRONT+"/offerta")
        return
    } catch (err) {
        res.status(500).json({
            successful:false,
            message:"Server error checkout success - failed!"
        })
        return
    }


}