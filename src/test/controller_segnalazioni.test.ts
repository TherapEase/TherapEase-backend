import request from 'supertest'
import { app } from '../server'
import mongoose from 'mongoose'

import { Cliente } from '../schemas/cliente_schema'
import { Terapeuta } from '../schemas/terapeuta_schema'
import { Utente } from '../schemas/utente_schema'
import { createToken } from '../controllers/controller_auth'
import { JWTToken } from '../schemas/token_schema'
import { Segnalazione } from '../schemas/segnalazione_schema'

describe('test /api/v1/catalogo_segnalazioni /api/v1/segnalazione/:id /segnalazione/gestisci/:id', ()=>{
    
    let mario_doc:any
    let giovi_doc:any
    let admin_doc:any
    let tommy_doc: any
    let segnalazione_doc:any
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
        segnalazione_doc={
            _id: "111",
            testo: "ciao",
            data: "2023-12-12T12:00",
            gestita: false
        }

        mongoose.connect= jest.fn().mockImplementation((conn_string)=>Promise.resolve(true)) //bypass del connect
        JWTToken.find = jest.fn().mockImplementation((criteria)=>{return{exec:jest.fn().mockResolvedValue([])}})//assumiamo il token non blacklisted
        Utente.findById=jest.fn().mockImplementation((_id)=>{return{exec:jest.fn().mockImplementation(()=>{
            if(_id=='123') return Promise.resolve(mario_doc)
            if(_id=='321') return Promise.resolve(giovi_doc)
            if(_id=='000') return Promise.resolve(admin_doc)
            if(_id=='444') return Promise.resolve(tommy_doc)
            if(_id=='111') return Promise.resolve(segnalazione_doc)
            return Promise.resolve(null)
        })}}) //per il tokenCheck, ritorna mario o giovi in base all'id
    })
    afterEach(()=>{
        jest.restoreAllMocks().clearAllMocks()
    })

    //get all segnalazioni correttamente funzionante -> funziona sul codice aggiornato
    it('GET /api/v1/catalogo_segnalazioni',async ()=>{
        Segnalazione.find = jest.fn().mockImplementation((filter)=>{return{exec:jest.fn().mockResolvedValue([segnalazione_doc])}})

        const res = await request(app).get('/api/v1/catalogo_segnalazioni').set("x-access-token",token_ad).send()
        expect(res.status).toBe(200)
    })

    //scrittura di una segnalazione
    it('POST /api/v1/segnalazione/:id', async()=>{
        Cliente.findById = jest.fn().mockImplementation((_id)=>{return{exec:jest.fn().mockResolvedValue(mario_doc)}})
        Terapeuta.findById = jest.fn().mockImplementation((_id)=>{return{exec:jest.fn().mockResolvedValue(giovi_doc)}})

        Segnalazione.findOne = jest.fn().mockImplementation((criteria)=>{return{exec:jest.fn().mockResolvedValue(null)}})
        Segnalazione.create = jest.fn().mockImplementation((doc)=>Promise.resolve(true))

        const res = await request(app).post('/api/v1/segnalazione/321').set("x-access-token",token).send({
            testo: "ciao",
            data: "2023-12-12"
        })
        expect(res.status).toBe(200)
    })

    //la segnalazione è già presente
     it('POST /api/v1/segnalazione/:id già presente', async()=>{
         Cliente.findById = jest.fn().mockImplementation((_id)=>{return{exec:jest.fn().mockResolvedValue(mario_doc)}})
         Terapeuta.findById = jest.fn().mockImplementation((_id)=>{return{exec:jest.fn().mockResolvedValue(giovi_doc)}})

         Segnalazione.findOne = jest.fn().mockImplementation((criteria)=>{return{exec:jest.fn().mockResolvedValue({
            testo: "ciao",
            data: "2023-12-12T12:00"
         })}})
         Segnalazione.create = jest.fn().mockImplementation((doc)=>Promise.resolve(true))

         const res = await request(app).post('/api/v1/segnalazione/'+giovi_doc._id).set("x-access-token",token).send({
            testo: "ciao",
            data: "2023-12-12"
        })
        expect(res.status).toBe(409)
     })

    //l'utente autenticato non può fare la segnalazione
     it('POST /api/v1/segnalazione/:id con permessi non validi', async()=>{
        Cliente.findById = jest.fn().mockImplementation((_id)=>{return{exec:jest.fn().mockResolvedValue(admin_doc)}})
        Terapeuta.findById = jest.fn().mockImplementation((_id)=>{return{exec:jest.fn().mockResolvedValue(giovi_doc)}})

        Segnalazione.findOne = jest.fn().mockImplementation((criteria)=>{return{exec:jest.fn().mockResolvedValue(null)}})
        Segnalazione.create = jest.fn().mockImplementation((doc)=>Promise.resolve(true))

        const res = await request(app).post('/api/v1/segnalazione/'+giovi_doc._id).set("x-access-token",token_ad).send({
            testo: "ciao",
            data: "2023-12-12"
        })
        expect(res.status).toBe(403)
     })

     // non trova la ruote
     it('POST /api/v1/segnalazione/:id non trova la ruote', async()=>{
         Cliente.findById = jest.fn().mockImplementation((_id)=>{return{exec:jest.fn().mockResolvedValue(mario_doc)}})
         Terapeuta.findById = jest.fn().mockImplementation((_id)=>{return{exec:jest.fn().mockResolvedValue(giovi_doc)}})

        Segnalazione.findOne = jest.fn().mockImplementation((criteria)=>{return{exec:jest.fn().mockResolvedValue(null)}})
        Segnalazione.create = jest.fn().mockImplementation((doc)=>Promise.resolve(true))
        // const fake_id = "999"
         const res = await request(app).post('/api/v1/segnalazione/').set("x-access-token",token).send({
            testo: "ciao",
            data: "2023-12-12"
        })         
        expect(res.status).toBe(404)
     })

     //cliente e terapeuta non sono associati
     it('POST /api/v1/segnalazione/:id non associati', async()=>{
        Cliente.findById = jest.fn().mockImplementation((_id)=>{return{exec:jest.fn().mockResolvedValue(mario_doc)}})
        Terapeuta.findById = jest.fn().mockImplementation((_id)=>{return{exec:jest.fn().mockResolvedValue(tommy_doc)}})

        Segnalazione.findOne = jest.fn().mockImplementation((criteria)=>{return{exec:jest.fn().mockResolvedValue(null)}})
        Segnalazione.create = jest.fn().mockImplementation((doc)=>Promise.resolve(true))

        const res = await request(app).post('/api/v1/segnalazione/'+tommy_doc._id).set("x-access-token",token).send({
            testo: "ciao",
            data: "2023-12-12"
        })         
        expect(res.status).toBe(409)
    })

    //gestisci segnalazione
    it('POST /api/v1/segnalazione/gestisci/:id', async()=>{
        Utente.findById = jest.fn().mockImplementation((_id)=>{return{exec:jest.fn().mockResolvedValue(admin_doc)}})
        Segnalazione.findOneAndUpdate = jest.fn().mockImplementation((criteria, change)=>{return{exec:jest.fn().mockResolvedValue(segnalazione_doc)}})

        const res = await request(app).post('/api/v1/segnalazione/gestisci/'+segnalazione_doc._id).set("x-access-token",token_ad).send({
            testo: "ciao",
            data: "2023-12-12",
            gestita: true
        })
        expect(res.status).toBe(200)
    })

    //gestisci segnalazione ma l'utente autenticato non è un admin
    it('POST /api/v1/segnalazione/gestisci/:id ma il loggedUser non è admin', async()=>{
        Cliente.findById = jest.fn().mockImplementation((_id)=>{return{exec:jest.fn().mockResolvedValue(mario_doc)}})
        Segnalazione.findOneAndUpdate = jest.fn().mockImplementation((criteria, change)=>{return{exec:jest.fn().mockResolvedValue(segnalazione_doc)}})

        const res = await request(app).post('/api/v1/segnalazione/gestisci/'+segnalazione_doc._id).set("x-access-token",token).send({
            testo: "ciao",
            data: "2023-12-12",
            gestita: true
        })
        expect(res.status).toBe(403)
    })

    //gestisci segnalazione ma l'id della segnalazione non è valido
    it('POST /api/v1/segnalazione/gestisci/:id', async()=>{
        Utente.findById = jest.fn().mockImplementation((_id)=>{return{exec:jest.fn().mockResolvedValue(admin_doc)}})
        Segnalazione.findOneAndUpdate = jest.fn().mockImplementation((criteria, update)=>{return{exec:jest.fn().mockResolvedValue(null)}})

        const res = await request(app).post('/api/v1/segnalazione/gestisci/'+"8888").set("x-access-token",token_ad).send({
            testo: "ciao",
            data: "2023-12-12",
            gestita: true
        })
        expect(res.status).toBe(409)
    })

})