import request from 'supertest'
import { app } from '../server'
import mongoose from 'mongoose'

import { Cliente } from '../schemas/cliente_schema'
import { Terapeuta } from '../schemas/terapeuta_schema'
import { Utente } from '../schemas/utente_schema'
import { createToken } from '../controllers/controller_auth'
import { JWTToken } from '../schemas/token_schema'

describe('test /api/v1/il_mio_profilo /api/v1/il_mio_profilo/modifica /api/v1/profilo/:id ',()=>{
    
    let mario_doc:any
    let giovi_doc:any
    let tommy_doc:any
    let token = createToken("123","mario_rossi",1)
    let token_t= createToken("111","tommy",2)
    //aggiungere anche i controlli per il terapeuta?
    beforeEach(()=>{
        mario_doc={
            _id:"123",
            username:"mario",
            password:"abcABC123$$",
            ruolo:1,
            nome:"mario",
            cognome:"rossi",
            email:"mariorossi@gmail.com",
            codice_fiscale: "RSSMRA",
            foto_profilo:"",
            data_nascita:"2020",
            associato:"321"
        }
        giovi_doc={
            _id:"321",
            username:"giovi",
            password:"abcABC123$$",
            ruolo:2,
            nome:"Giovanna",
            cognome:"Bianchi",
            email:"giovannabianchi@gmail.com",
            codice_fiscale: "BNCGVN",
            foto_profilo:"",
            data_nascita:"2020",
            associati:["123"]
        }
        tommy_doc={
            _id:"111",
            username:"tommy",
            password:"abcABC123$$",
            ruolo:2,
            nome:"Tommaso",
            cognome:"Stella",
            email:"tommasostella@gmail.com",
            codice_fiscale: "STLTMM",
            foto_profilo:"",
            data_nascita:"2020",
            associati:["123"]
        }

        mongoose.connect= jest.fn().mockImplementation((conn_string)=>Promise.resolve(true)) //bypass del connect
        JWTToken.find = jest.fn().mockImplementation((criteria)=>{return{exec:jest.fn().mockResolvedValue([])}})//assumiamo il token non blacklisted
        Utente.findById=jest.fn().mockImplementation((_id)=>{return{exec:jest.fn().mockImplementation(()=>{
            if(_id=='123') return Promise.resolve(mario_doc)
            if(_id=='321') return Promise.resolve(giovi_doc)
            if(_id=='111') return Promise.resolve(tommy_doc)
            return Promise.resolve(null)
        })}}) //per il tokenCheck, ritorna mario o giovi in base all'id
    })
    afterEach(()=>{
        jest.restoreAllMocks().clearAllMocks()
    })

    it('GET /api/v1/il_mio_profilo di un utente autenticato',async ()=>{
        Cliente.findById = jest.fn().mockImplementation((_id,filter)=>{return{exec:jest.fn().mockResolvedValue(mario_doc)}})
        Terapeuta.findById = jest.fn().mockImplementation((_id,filter)=>{return{exec:jest.fn().mockResolvedValue(mario_doc)}})

        const res = await request(app).get('/api/v1/il_mio_profilo').set("x-access-token",token).send()
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
        expect(res.status).toBe(200)
    })
    it('GET /api/v1/profilo/id_giovi di mario, cliente autenticato',async()=>{
        Cliente.findById = jest.fn().mockImplementation((_id,filter)=>{return{exec:jest.fn().mockResolvedValue(mario_doc)}})
        Terapeuta.findById = jest.fn().mockImplementation((_id,filter)=>{return{exec:jest.fn().mockResolvedValue(giovi_doc)}})

        const res = await request(app).get('/api/v1/profilo/'+giovi_doc._id).set("x-access-token",token).send()
        expect(res.status).toBe(200)
        expect(res.body).toHaveProperty("profilo")
    })
    it('GET /api/v1/profilo/id_utente_non_esistente di mario, autenticato',async()=>{
        Cliente.findById = jest.fn().mockImplementation((_id,filter)=>{return{exec:jest.fn().mockResolvedValue(mario_doc)}})

        const res = await request(app).get('/api/v1/profilo/567').set("x-access-token",token).send()
        expect(res.status).toBe(404)
    })
    it('GET /api/v1/profilo/id_giovi di tommy, terapeuta autenticato',async()=>{
        Terapeuta.findById = jest.fn().mockImplementation((_id,filter)=>{return{exec:jest.fn().mockImplementation(()=>{
            if(_id=='321') return Promise.resolve(giovi_doc)
            if(_id=='111') return Promise.resolve(tommy_doc)
            return Promise.resolve(null)
        })}})

        const res = await request(app).get('/api/v1/profilo/'+giovi_doc._id).set("x-access-token",token_t).send()
        expect(res.status).toBe(403)
    })
})