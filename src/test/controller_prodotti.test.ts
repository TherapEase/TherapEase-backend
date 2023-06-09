import request from 'supertest'
import { app } from '../server'
import { describe } from 'node:test'
import { Utente } from '../schemas/utente_schema'
import mongoose from 'mongoose'
import { createToken } from '../controllers/controller_auth'
import { JWTToken } from '../schemas/token_schema'
import { Prodotto } from '../schemas/prodotto_schema'
import { Session } from 'node:inspector'
import { Sessione } from '../schemas/sessione_stripe_schema'
const stripe = require('stripe')(process.env.SK_STRIPE);

describe('/api/v1/prodotto/inserisci, /api/v1/prodotto/rimuovi/:id, /api/v1/catalogo_prodotti',()=>{
    let mario_doc:any
    let admin_doc:any
    let prodotto_doc:any
    let session_doc:any
    let token = createToken("123","mario_rossi",1)
    let token_a= createToken("777","admin",4)

    beforeEach(async()=>{
        mario_doc ={
            _id:"123",
            username:"mario",
            password:"abcABC123$$",
            ruolo:1,
            nome:"mario",
            cognome:"rossi",
            email:"mariorossi@gmail.com",
            codice_fiscale: "RSSMRA",
            foto_profilo:"",
            data_nascita:"2020"
        }
        admin_doc ={
            _id:"777",
            usernmane: "admin",
            password: "abcABC123$?",
            ruolo:4
        }
        prodotto_doc={
            _id:"1000",
            prezzo: 150,
            n_gettoni:3,
            nome: "test1"
        }
        session_doc={
            _id:"3000",
            n_gettoni:3,
            id_cliente:"123"
        }

        
        mongoose.connect= jest.fn().mockImplementation((conn_string)=>Promise.resolve(true)) //bypass del connect
        JWTToken.find = jest.fn().mockImplementation((criteria)=>{return{exec:jest.fn().mockResolvedValue([])}})//assumiamo il token non blacklisted
        Utente.findById=jest.fn().mockImplementation((_id)=>{return{exec:jest.fn().mockImplementation(()=>{
            if(_id=='123') return Promise.resolve(mario_doc)
            if(_id=='777') return Promise.resolve(admin_doc)
            return Promise.resolve(null)
        })}})
        Prodotto.find =  jest.fn().mockImplementation((criteria)=>{return{exec:jest.fn().mockResolvedValue([prodotto_doc])}})
        Prodotto.findOne = jest.fn().mockImplementation((criteria)=>{return{exec:jest.fn().mockResolvedValue(null)}})
        Prodotto.create = jest.fn().mockImplementation((doc)=>Promise.resolve(true)) 
        Prodotto.findOneAndDelete = jest.fn().mockImplementation((criteria)=>{return{exec:jest.fn().mockResolvedValue(prodotto_doc)}})
        Sessione.create = jest.fn().mockImplementation((doc)=>Promise.resolve(true)) 
        stripe.checkout.sessions.create = jest.fn().mockImplementation((doc)=>{return{exec:jest.fn().mockResolvedValue(null)}}) 

    })
    afterEach(()=>{
        jest.restoreAllMocks().clearAllMocks()
    })

 

    it('POST /api/v1/prodotto/inserisci da parte di un admin autenticato', async()=>{
        Utente.findById = jest.fn().mockImplementation((_id,filter)=>{return{exec:jest.fn().mockResolvedValue(admin_doc)}})

        const res = await request(app).post('/api/v1/prodotto/inserisci').set("x-access-token", token_a).send({
            nome:"test1",
            prezzo: 150,
            n_gettoni:3
        })
        expect(res.status).toBe(200)
    })

    it('POST /api/v1/prodotto/inserisci da parte di un utente autenticato NON admin', async()=>{
        Utente.findById = jest.fn().mockImplementation((_id,filter)=>{return{exec:jest.fn().mockResolvedValue(admin_doc)}})

        const res = await request(app).post('/api/v1/prodotto/inserisci').set("x-access-token", token).send({
            nome:"test1",
            prezzo: 150,
            n_gettoni:3
        })
        expect(res.status).toBe(403)
    })

    it('POST /api/v1/prodotto/inserisci da parte di un admin autenticato + richiesta non completa', async()=>{
        Utente.findById = jest.fn().mockImplementation((_id,filter)=>{return{exec:jest.fn().mockResolvedValue(admin_doc)}})

        const res = await request(app).post('/api/v1/prodotto/inserisci').set("x-access-token", token_a).send({
            nome:"test1",
            n_gettoni:3
        })
        expect(res.status).toBe(400)
    })

    it('POST /api/v1/prodotto/inserisci da parte di un admin + prodotto gia esistente', async()=>{
        Utente.findById = jest.fn().mockImplementation((_id,filter)=>{return{exec:jest.fn().mockResolvedValue(admin_doc)}})
        Prodotto.findOne = jest.fn().mockImplementation((criteria)=>{return{exec:jest.fn().mockResolvedValue(prodotto_doc)}})
        
        const res = await request(app).post('/api/v1/prodotto/inserisci').set("x-access-token", token_a).send({
            nome:"test1",
            prezzo: 150,
            n_gettoni:3
        })
        expect(res.status).toBe(409)
    })



    it('DELETE /api/v1/prodotto/rimuovi/:id da admin', async()=>{
        const res = await request(app).delete('/api/v1/prodotto/rimuovi/1000').set("x-access-token",token_a).send()
        expect(res.status).toBe(200)
    })

    it('DELETE /api/v1/prodotto/rimuovi/:id da NOT admin', async()=>{
        const res = await request(app).delete('/api/v1/prodotto/rimuovi/1000').set("x-access-token",token).send()
        expect(res.status).toBe(403)
    })

    it('DELETE /api/v1/prodotto/rimuovi/:id da admin', async()=>{
        Prodotto.findOneAndDelete = jest.fn().mockImplementation((criteria)=>{return{exec:jest.fn().mockResolvedValue(null)}})
        const res = await request(app).delete('/api/v1/prodotto/rimuovi/1000').set("x-access-token",token_a).send()
        expect(res.status).toBe(409)
    })

    it('GET /api/v1/catalogo_prodotti', async()=>{
        const res = await request(app).get('/api/v1/catalogo_prodotti').send()
        expect(res.status).toBe(200)
    })



    it('POST /api/prodotto/checkout/:id',async()=>{
        Prodotto.findById = jest.fn().mockImplementation((_id)=>{return{exec:jest.fn().mockResolvedValue(prodotto_doc)}})
        const res = await request(app).post('/api/v1/prodotto/checkout/'+prodotto_doc._id).set("x-access-token", token).send({
        })
        expect(res.status).toBe(200)
    })

    it('POST /api/prodotto/checkout/:id NOT cliente',async()=>{
        const res = await request(app).post('/api/v1/prodotto/checkout/'+prodotto_doc._id).set("x-access-token", token_a).send({
        })
        expect(res.status).toBe(403)
    })

    // it('POST /api/prodotto/checkout/:id NOT cliente',async()=>{
    //     Prodotto.findById = jest.fn().mockImplementation((_id)=>{return{exec:jest.fn().mockResolvedValue(prodotto_doc)}})
    //     const res = await request(app).post('/api/v1/prodotto/checkout/'+prodotto_doc._id).set("x-access-token", token_a).send({
    //     })
    //     expect(res.status).toBe(403)
    // })

})