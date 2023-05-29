import request from 'supertest'
import { app } from '../server'
import mongoose from 'mongoose'
import jwt from 'jsonwebtoken'

import { Cliente } from '../schemas/cliente_schema'
import { Terapeuta } from '../schemas/terapeuta_schema'
import { Utente } from '../schemas/utente_schema'
import { createToken } from '../controllers/controller_auth'
import { JWTToken } from '../schemas/token_schema'

describe('test /api/v1/il_mio_profilo /api/v1/il_mio_profilo/modifica /api/v1/profilo/:id ',()=>{
    
    let mario_doc:any
    let token = createToken("123","mario_rossi",1)
    //aggiungere anche i controlli per il terapeuta?
    beforeEach(()=>{
        mario_doc={
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

        mongoose.connect= jest.fn().mockImplementation((conn_string)=>Promise.resolve(true)) //bypass del connect
        JWTToken.find = jest.fn().mockImplementation((criteria)=>{return{exec:jest.fn().mockResolvedValue([])}})//assumiamo il token non blacklisted
        Utente.findById=jest.fn().mockResolvedValue(mario_doc) //per il tokenCheck, ritorna l'utente
    })
    afterEach(()=>{
        jest.restoreAllMocks().clearAllMocks()
    })

    it('GET /api/v1/il_mio_profilo di un utente autenticato',async ()=>{
        Cliente.findById = jest.fn().mockImplementation((_id,filter)=>{return{exec:jest.fn().mockResolvedValue(mario_doc)}})
        Terapeuta.findById = jest.fn().mockImplementation((_id,filter)=>{return{exec:jest.fn().mockResolvedValue(mario_doc)}})

        const res = await request(app).get('/api/v1/il_mio_profilo').set("x-access-token",token).send()
        console.log(res.body.message)
        expect(res.status).toBe(200)
    })

    it('POST /api/v1/il_mio_profilo/modifica',async()=>{
        /**
         * Su <BASE>/il_mio_profilo/modifica fare una richiesta post contenente
         *  i campi da modificare e i relativi valori,
         *  ovvero {
         * nome:"tomas", 
         * email:"tom.stel@gmail.com"}
         */
        Cliente.findById = jest.fn().mockImplementation((_id,filter)=>{return{exec:jest.fn().mockResolvedValue(mario_doc)}})
        Terapeuta.findById = jest.fn().mockImplementation((_id,filter)=>{return{exec:jest.fn().mockResolvedValue(mario_doc)}})
        mario_doc.nome="tomas"
        mario_doc.email="tom.stel@gmail.com"
        Cliente.findByIdAndUpdate= jest.fn().mockImplementation((_id,filter)=>{return{exec:jest.fn().mockResolvedValue(mario_doc)}})
        Terapeuta.findByIdAndUpdate = jest.fn().mockImplementation((_id,filter)=>{return{exec:jest.fn().mockResolvedValue(mario_doc)}})
        const res = await request(app).post('/api/v1/il_mio_profilo/modifica').set("x-access-token",token).send({
            nome:"tomas",
            email:"tom.stel@gmail.com"
        })
        console.log(res.body.message)
        expect(res.status).toBe(200)
    })
})