import request from 'supertest'
import { app } from '../server'
import mongoose from 'mongoose'

import { Cliente } from '../schemas/cliente_schema'
import { Terapeuta } from '../schemas/terapeuta_schema'
import { Utente } from '../schemas/utente_schema'
import { createToken } from '../controllers/controller_auth'
import { JWTToken } from '../schemas/token_schema'
import { Segnalazione } from '../schemas/segnalazione_schema'
import { Recensione } from '../schemas/recensione_schema'

describe('GET /api/v1/recensioni_associato/:id /api/v1/le_mie_recensioni /recensioni/:id', ()=>{
    
    let mario_doc:any
    let giovi_doc:any
    let admin_doc:any
    let tommy_doc: any
    let recensione_doc:any
    let token = createToken("123","mario",1)
    let token_ad = createToken("000", "admin", 4)
    let token_g = createToken("321", "giovi", 2)
    let token_t = createToken("444", "tommy", 2)
    //aggiungere anche i controlli per il terapeuta?
    beforeEach(()=>{
        mario_doc={
            _id:"123",
            username:"mario",
            password:"abcABC111$$",
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
            associati:["123"],
            limite_clienti: 25
        }
        tommy_doc={
            _id:"444",
            username:"tommy",
            password:"abcABC444$$",
            ruolo:2,
            nome:"Tommaso",
            cognome:"Bianchi",
            email:"tommybianchi@gmail.com",
            codice_fiscale: "BNCGVN",
            foto_profilo:"",
            data_nascita:"2020",
            associati:[],
            limite_clienti: 25
        }
        admin_doc={
            _id:"000",
            username:"admin",
            password:"abcABC000$$",
            ruolo:4
        }
        recensione_doc={
            _id: "111",
            testo: "molto bravo",
            voto: 3
        }

        mongoose.connect= jest.fn().mockImplementation((conn_string)=>Promise.resolve(true)) //bypass del connect
        JWTToken.find = jest.fn().mockImplementation((criteria)=>{return{exec:jest.fn().mockResolvedValue([])}})//assumiamo il token non blacklisted
        Utente.findById=jest.fn().mockImplementation((_id)=>{return{exec:jest.fn().mockImplementation(()=>{
            if(_id=='123') return Promise.resolve(mario_doc)
            if(_id=='321') return Promise.resolve(giovi_doc)
            if(_id=='000') return Promise.resolve(admin_doc)
            if(_id=='444') return Promise.resolve(tommy_doc)
            if(_id=='111') return Promise.resolve(recensione_doc)
            return Promise.resolve(null)
        })}}) //per il tokenCheck, ritorna mario o giovi in base all'id
    })
    afterEach(()=>{
        jest.restoreAllMocks().clearAllMocks()
    })

    //leggi recensioni del terapeuta associato
    it('GET /api/v1/recensioni_associato/:id',async ()=>{
        Recensione.find = jest.fn().mockImplementation((_id,filter)=>{return{exec:jest.fn().mockResolvedValue(recensione_doc)}})

        const res = await request(app).get('/api/v1/recensioni_associato/'+giovi_doc._id).set("x-access-token",token).send()
        expect(res.status).toBe(200)
    })

    //leggi recensioni associato ma il loggedUser non è un cliente
    it('GET /api/v1/recensioni_associato/:id ma il loggedUser non è un cliente',async ()=>{
        Recensione.find = jest.fn().mockImplementation((_id,filter)=>{return{exec:jest.fn().mockResolvedValue(recensione_doc)}})

        const res = await request(app).get('/api/v1/recensioni_associato/'+giovi_doc._id).set("x-access-token",token_ad).send()
        expect(res.status).toBe(403)
    })

    //il terapeuta legge le sue recensioni
    it('GET /api/v1/le_mie_recensioni',async ()=>{
        Recensione.find = jest.fn().mockImplementation((_id,filter)=>{return{exec:jest.fn().mockResolvedValue(recensione_doc)}})

        const res = await request(app).get('/api/v1/le_mie_recensioni').set("x-access-token",token_g).send()
        expect(res.status).toBe(200)
    })

    //leggi recensioni associato ma il loggedUser non è un terapeuta
    it('GET /api/v1/recensioni_associato/:id ma il loggedUser non è un terapeuta',async ()=>{
        Recensione.find = jest.fn().mockImplementation((_id,filter)=>{return{exec:jest.fn().mockResolvedValue(recensione_doc)}})

        const res = await request(app).get('/api/v1/le_mie_recensioni').set("x-access-token",token_ad).send()
        expect(res.status).toBe(403)
    })

    //Un utente correttamente autenticato come cliente vuole scrivere una recensione a favore del suo terapeuta associato. Specificando tutte le informazioni richieste
    it('POST /api/v1/recensioni/:id', async()=>{
        Terapeuta.findById = jest.fn().mockImplementation((_id,filter)=>{return{exec:jest.fn().mockResolvedValue(giovi_doc)}})

        Recensione.findOne = jest.fn().mockImplementation(()=>{return{exec:jest.fn().mockResolvedValue(null)}})
        Recensione.create = jest.fn().mockImplementation(()=>Promise.resolve(true))

        Terapeuta.findByIdAndUpdate = jest.fn().mockImplementation((_id,filter)=>{return{exec:jest.fn().mockResolvedValue(giovi_doc)}})

        const res = await request(app).post('/api/v1/recensioni/'+giovi_doc._id).set("x-access-token",token).send({
            testo: "molto bello",
            voto: 3
        })
        expect(res.status).toBe(200)
    })

    //non trova la ruote
    it('POST /api/v1/recensioni/:id -> non trova la ruote', async()=>{
        Terapeuta.findById = jest.fn().mockImplementation((_id,filter)=>{return{exec:jest.fn().mockResolvedValue(giovi_doc)}})

        Recensione.findOne = jest.fn().mockImplementation(()=>{return{exec:jest.fn().mockResolvedValue(null)}})
        Recensione.create = jest.fn().mockImplementation(()=>Promise.resolve(true))

        Terapeuta.findByIdAndUpdate = jest.fn().mockImplementation((_id,filter)=>{return{exec:jest.fn().mockResolvedValue(giovi_doc)}})

        const res = await request(app).post('/api/v1/recensioni/').set("x-access-token",token).send({
            testo: "molto bello",
            voto: 3
        })
        expect(res.status).toBe(404)
    })

    //la recensione esiste già
    it('POST /api/v1/recensioni/:id review already present', async()=>{
        Terapeuta.findById = jest.fn().mockImplementation((_id,filter)=>{return{exec:jest.fn().mockResolvedValue(giovi_doc)}})

        Recensione.findOne = jest.fn().mockImplementation(()=>{return{exec:jest.fn().mockResolvedValue({
            testo: "molto bello",
            voto: 3
        })}})
        Recensione.create = jest.fn().mockImplementation(()=>Promise.resolve(true))

        Terapeuta.findByIdAndUpdate = jest.fn().mockImplementation((_id,filter)=>{return{exec:jest.fn().mockResolvedValue(giovi_doc)}})

        const res = await request(app).post('/api/v1/recensioni/'+giovi_doc._id).set("x-access-token",token).send({
            testo: "molto bello",
            voto: 3
        })
        expect(res.status).toBe(409)
    })

    // non ci sono abbastanza argomenti
    it('POST /api/v1/recensioni/:id not enough arguments', async()=>{
        Terapeuta.findById = jest.fn().mockImplementation((_id,filter)=>{return{exec:jest.fn().mockResolvedValue(giovi_doc)}})

        Recensione.findOne = jest.fn().mockImplementation(()=>{return{exec:jest.fn().mockResolvedValue(null)}})
        Recensione.create = jest.fn().mockImplementation(()=>Promise.resolve(true))

        Terapeuta.findByIdAndUpdate = jest.fn().mockImplementation((_id,filter)=>{return{exec:jest.fn().mockResolvedValue(giovi_doc)}})

        const res = await request(app).post('/api/v1/recensioni/'+giovi_doc._id).set("x-access-token",token).send({
            testo: "molto bello"
        })
        expect(res.status).toBe(400)
    })
})