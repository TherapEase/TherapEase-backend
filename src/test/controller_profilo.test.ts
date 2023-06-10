import request from 'supertest'
import { app } from '../server'
import mongoose from 'mongoose'

import { Cliente } from '../schemas/cliente_schema'
import { Terapeuta } from '../schemas/terapeuta_schema'
import { Utente } from '../schemas/utente_schema'
import { createToken } from '../controllers/controller_auth'
import { JWTToken } from '../schemas/token_schema'

describe('test /api/v1/il_mio_profilo /api/v1/il_mio_profilo/modifica /api/v1/profilo/:id /api/v1/catalogo_terapeuti /api/v1/catalogo_clienti and DELETE',()=>{
    
    let mario_doc:any
    let luca_doc:any
    let giovi_doc:any
    let tommy_doc:any
    let admin_doc:any
    let token = createToken("123","mario_rossi",1)
    let token_t= createToken("111","tommy",2)
    let token_a= createToken("777","admin",4)
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
        luca_doc={
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
        admin_doc ={
            _id:"777",
            usernmane: "admin",
            password: "abcABC123$?",
            ruolo:4
        }

        mongoose.connect= jest.fn().mockImplementation((conn_string)=>Promise.resolve(true)) //bypass del connect
        JWTToken.find = jest.fn().mockImplementation((criteria)=>{return{exec:jest.fn().mockResolvedValue([])}})//assumiamo il token non blacklisted
        Utente.findById=jest.fn().mockImplementation((_id)=>{return{exec:jest.fn().mockImplementation(()=>{
            if(_id=='123') return Promise.resolve(mario_doc)
            if(_id=='321') return Promise.resolve(giovi_doc)
            if(_id=='111') return Promise.resolve(tommy_doc)
            if(_id=='777') return Promise.resolve(admin_doc)
            return Promise.resolve(null)
        })}}) //per il tokenCheck, ritorna mario o giovi in base all'id
        Terapeuta.find=jest.fn().mockImplementation((criteria)=>{return{exec:jest.fn().mockResolvedValue([tommy_doc, giovi_doc])}})
        Cliente.find=jest.fn().mockImplementation((criteria)=>{return{exec:jest.fn().mockResolvedValue([mario_doc, luca_doc])}})
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

    it('GET /api/v1/catalogo_terapeuti',async () => {
        const res = await request(app).get('/api/v1/catalogo_terapeuti').send()
        expect(res.status).toBe(200)
    })  

    it('GET /api/v1/catalogo_clienti by admin',async () => {
        const res = await request(app).get('/api/v1/catalogo_clienti').set("x-access-token",token_a).send()
        expect(res.status).toBe(200)
    })
    
    it('GET /api/v1/catalogo_clienti by NOT admin',async () => {
        const res = await request(app).get('/api/v1/catalogo_clienti').set("x-access-token",token).send()
        expect(res.status).toBe(403)
    })  

    it('DELETE /api/v1/profilo/:id/elimina by admin',async () => {
        Utente.findByIdAndDelete = jest.fn().mockImplementation((criteria)=>{return{exec:jest.fn().mockResolvedValue(mario_doc)}})
        
        const res = await request(app).delete('/api/v1/profilo/'+mario_doc._id+"/elimina").set("x-access-token",token_a).send()
        expect(res.status).toBe(200)
    }) 

    it('DELETE /api/v1/profilo/:id/elimina by NOT admin',async () => {
        const res = await request(app).delete('/api/v1/profilo/'+mario_doc._id+"/elimina").set("x-access-token",token_t).send()
        expect(res.status).toBe(403)
    }) 

    it('DELETE /api/v1/profilo/:id/elimina by admin, user NOT existent',async () => {
        Utente.findByIdAndDelete = jest.fn().mockImplementation((criteria)=>{return{exec:jest.fn().mockResolvedValue(null)}})
        
        const res = await request(app).delete('/api/v1/profilo/'+"8888"+"/elimina").set("x-access-token",token_a).send()
        expect(res.status).toBe(404)
    }) 

})