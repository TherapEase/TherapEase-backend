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
import { Info } from '../schemas/info_eventi_schema'

describe('eventi_info tests',()=>{
    let mario_doc:any
    let admin_doc:any
    let evento1_doc:any
    let evento2_doc:any
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
        evento1_doc={
            _id:"3000",
            data:"2023-12-12",
            foto:"",
            testo:"Ciao1",
            titolo:"Test prima prova"
        }
        evento2_doc={
            _id:"3001",
            data:"2024-12-12",
            foto:"",
            testo:"Ciao",
            titolo:"Test prova"
        }

        mongoose.connect= jest.fn().mockImplementation((conn_string)=>Promise.resolve(true)) //bypass del connect
        JWTToken.find = jest.fn().mockImplementation((criteria)=>{return{exec:jest.fn().mockResolvedValue([])}})//assumiamo il token non blacklisted
        Utente.findById=jest.fn().mockImplementation((_id)=>{return{exec:jest.fn().mockImplementation(()=>{
            if(_id=='123') return Promise.resolve(mario_doc)
            if(_id=='777') return Promise.resolve(admin_doc)
            return Promise.resolve(null)
        })}})
        Info.find = jest.fn().mockImplementation((criteria)=>{return{exec:jest.fn().mockResolvedValue([evento1_doc, evento2_doc])}})
        Info.findOne = jest.fn().mockImplementation((criteria)=>{return{exec:jest.fn().mockResolvedValue(evento2_doc)}})
        Info.create = jest.fn().mockImplementation((doc)=>Promise.resolve(true))
        Info.findOneAndDelete = jest.fn().mockImplementation((_id)=>{return{exec:jest.fn().mockResolvedValue(evento2_doc)}})
    })

    afterEach(()=>{
            jest.restoreAllMocks().clearAllMocks()
    })



    it('GET /api/v1/eventi',async () => {
        const res = await request(app).get('/api/v1/eventi').send()
        expect(res.status).toBe(200)
    })



    it('POST /api/v1/aggiungi_evento admin, evento non esistente',async () => {
        Info.findOne = jest.fn().mockImplementation(()=>Promise.resolve(false))
        
        const res = await request(app).post('/api/v1/aggiungi_evento').set("x-access-token", token_a).send({
            data:"2024-12-12T12:00",
            testo:"Ciao",
            titolo:"Test prova"
        })
        expect(res.status).toBe(200)
    })

    it('POST /api/v1/aggiungi_evento NOT admin',async () => {
        const res = await request(app).post('/api/v1/aggiungi_evento').set("x-access-token", token).send({
            data:"2024-12-12T12:00",
            testo:"Ciao",
            titolo:"Test prova"
        })
        expect(res.status).toBe(403)
    })

    it('POST /api/v1/aggiungi_evento admin, mancanza campi',async () => {
        Info.findOne = jest.fn().mockImplementation(()=>Promise.resolve(false))
        
        const res = await request(app).post('/api/v1/aggiungi_evento').set("x-access-token", token_a).send({
            data:"2024-12-12T12:00",
            testo:"Ciao"
        })
        expect(res.status).toBe(400)
    })

    it('POST /api/v1/aggiungi_evento admin, evento nel passato',async () => {
        Info.findOne = jest.fn().mockImplementation(()=>Promise.resolve(false))
        
        const res = await request(app).post('/api/v1/aggiungi_evento').set("x-access-token", token_a).send({
            data:"2020-12-12T12:00",
            testo:"Ciao",
            titolo:"Test prova"
        })
        expect(res.status).toBe(409)
    })


    it('POST /api/v1/aggiungi_evento admin, evento gia esistente',async () => {
        
        const res = await request(app).post('/api/v1/aggiungi_evento').set("x-access-token", token_a).send({
            data:"2024-12-12T12:00",
            testo:"Ciao",
            titolo:"Test prova"
        })
        expect(res.status).toBe(409)
    })


    it('DELETE /api/v1/rimuovi_evento/:id admin, evento esistente',async () => {
        const res = await request(app).delete("/api/v1/rimuovi_evento/"+evento1_doc._id).set("x-access-token", token_a).send()
        expect(res.status).toBe(200)
    })

    it('DELETE /api/v1/rimuovi_evento/:id admin, evento non esistente',async () => {
        Info.findOneAndDelete = jest.fn().mockImplementation((_id)=>{return{exec:jest.fn().mockResolvedValue(null)}})
        const res = await request(app).delete("/api/v1/rimuovi_evento/"+evento1_doc._id).set("x-access-token", token_a).send()
        expect(res.status).toBe(200)
    })

})