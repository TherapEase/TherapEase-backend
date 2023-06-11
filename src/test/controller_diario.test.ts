import request from 'supertest'
import { app } from '../server'
import mongoose from 'mongoose'

import { Cliente } from '../schemas/cliente_schema'
import { Terapeuta } from '../schemas/terapeuta_schema'
import { Utente } from '../schemas/utente_schema'
import { createToken } from '../controllers/controller_auth'
import { JWTToken } from '../schemas/token_schema'
import { Pagina } from '../schemas/pagina_schema'
import { Diario } from '../schemas/diario_schema'

describe('test diario', () => {
    let mario_doc: any
    let giovi_doc: any
    let diario_doc: any
    let seduta_doc: any
    let pagina_doc: any

    let token = createToken("123", "mario_rossi", 1)
    let token_g = createToken("321", "giovi", 2)

    beforeEach(() => {
        mario_doc = {
            _id: "123",
            username: "mario",
            password: "abcABC123$$",
            ruolo: 1,
            nome: "mario",
            cognome: "rossi",
            email: "mariorossi@gmail.com",
            codice_fiscale: "RSSMRA",
            foto_profilo: "",
            data_nascita: "2020",
            associato: "321",
            diario: "1"
        }
        giovi_doc = {
            _id: "321",
            username: "giovi",
            password: "abcABC123$$",
            ruolo: 2,
            nome: "Giovanna",
            cognome: "Bianchi",
            email: "giovannabianchi@gmail.com",
            codice_fiscale: "BNCGVN",
            foto_profilo: "",
            data_nascita: "2020",
            associati: ["123"]
        }

        seduta_doc = {
            data: "2023-06-30T12:00:00.000+00:00",
            presenza: true
        }



        pagina_doc = {
            _id: "11",
            data: "2023-05-30T12:00:00.000+00:00",
            testo: "ciao",

        }

        diario_doc = {
            _id: "1",
            pagine: ["11", "22"],
            cliente: "123"
        }





        mongoose.connect = jest.fn().mockImplementation((conn_string) => Promise.resolve(true)) //bypass del connect
        JWTToken.find = jest.fn().mockImplementation((criteria) => { return { exec: jest.fn().mockResolvedValue([]) } })//assumiamo il token non blacklisted
        Utente.findById = jest.fn().mockImplementation((_id) => {
            return {
                exec: jest.fn().mockImplementation(() => {
                    if (_id == '123') return Promise.resolve(mario_doc)
                    if (_id == '321') return Promise.resolve(giovi_doc)
                    return Promise.resolve(null)
                })
            }
        })



        // Seduta.findOne = jest.fn().mockImplementation(() => { return { exec: jest.fn().mockResolvedValue(null) } })
        // Terapeuta.findById = jest.fn().mockImplementation((_id, filter) => { return { exec: jest.fn().mockResolvedValue(giovi_doc) } })


    })



    afterEach(() => {
        jest.restoreAllMocks().clearAllMocks()
    })


    it('POST /api/v1/crea_pagina correttamente', async () => {
        Pagina.findOne = jest.fn().mockImplementation(() => { return { exec: jest.fn().mockResolvedValue(null) } })
        Diario.findOne = jest.fn().mockImplementation(() => { return { exec: jest.fn().mockResolvedValue(diario_doc) } })
        Pagina.create = jest.fn().mockImplementation(() => Promise.resolve(true))
        Diario.create = jest.fn().mockImplementation(() => Promise.resolve(true))
        Diario.findOneAndUpdate = jest.fn().mockImplementation(() => { return { exec: jest.fn().mockResolvedValue(diario_doc) } })
        Cliente.findByIdAndUpdate = jest.fn().mockImplementation(() => { return { exec: jest.fn().mockResolvedValue(mario_doc) } })

        const res = await request(app).post('/api/v1/crea_pagina').set("x-access-token", token).send(pagina_doc)
        expect(res.status).toBe(200)
        expect(res.body.successful).toBe(true)

    })



    it('POST /api/v1/crea_pagina senza specificare tutti gli attributi', async () => {
        
        const res = await request(app).post('/api/v1/crea_pagina').set("x-access-token", token).send({ data: "2023-05-30" })
        expect(res.status).toBe(400)
        expect(res.body.successful).toBe(false)
    })


    it('POST /api/v1/crea_pagina data nel futuro', async () => {
        
        const res = await request(app).post('/api/v1/crea_pagina').set("x-access-token", token).send({
            data: "2025-06-30T12:00:00.000+00:00",
            testo: "ciao",

        }
        )
        expect(res.status).toBe(400)
        expect(res.body.successful).toBe(false)
    })

    it('GET /api/v1/leggi_pagine dal profilo', async()=>{
        Pagina.find= jest.fn().mockImplementation(() => { return { exec: jest.fn().mockResolvedValue(pagina_doc) } })
        
        const res = await request(app).get('/api/v1/leggi_pagine').set("x-access-token", token).send()
        expect(res.status).toBe(200)
        expect(res.body.successful).toBe(true)
    })

    it('GET /api/v1/leggi_pagine con profilo terapeuta', async()=>{
        Pagina.find= jest.fn().mockImplementation(() => { return { exec: jest.fn().mockResolvedValue(pagina_doc) } })
        
        const res = await request(app).get('/api/v1/leggi_pagine').set("x-access-token", token_g).send()
        expect(res.status).toBe(403)
        expect(res.body.successful).toBe(false)
    })

    it('GET /api/v1/leggi_pagine/:id ok', async()=>{
        Pagina.find= jest.fn().mockImplementation(() => { return { exec: jest.fn().mockResolvedValue(pagina_doc) } })
        Terapeuta.findOne= jest.fn().mockImplementation(() => { return { exec: jest.fn().mockResolvedValue(giovi_doc) } })
        const res = await request(app).get('/api/v1/leggi_pagine/'+mario_doc._id).set("x-access-token", token_g).send()
        expect(res.status).toBe(200)
        expect(res.body.successful).toBe(true)
    })

    it('GET /api/v1/leggi_pagine/:id con profilo cliente', async()=>{
        Pagina.find= jest.fn().mockImplementation(() => { return { exec: jest.fn().mockResolvedValue(pagina_doc) } })
        Terapeuta.findOne= jest.fn().mockImplementation(() => { return { exec: jest.fn().mockResolvedValue(giovi_doc) } })
        const res = await request(app).get('/api/v1/leggi_pagine/'+mario_doc._id).set("x-access-token", token).send()
        expect(res.status).toBe(403)
        expect(res.body.successful).toBe(false)
    })

    it('GET /api/v1/leggi_pagine/:id di un cliente non associato', async()=>{
        Pagina.find= jest.fn().mockImplementation(() => { return { exec: jest.fn().mockResolvedValue(pagina_doc) } })
        Terapeuta.findOne= jest.fn().mockImplementation(() => { return { exec: jest.fn().mockResolvedValue(giovi_doc) } })
        giovi_doc.associati=[]
        const res = await request(app).get('/api/v1/leggi_pagine/'+mario_doc._id).set("x-access-token", token_g).send()
        expect(res.status).toBe(403)
        expect(res.body.successful).toBe(false)
    })

    it('POST /api/v1/modifica_pagina ok', async()=>{
        Pagina.findOne= jest.fn().mockImplementation(() => { return { exec: jest.fn().mockResolvedValue(pagina_doc) } })
        Pagina.findOneAndUpdate= jest.fn().mockImplementation(() => { return { exec: jest.fn().mockResolvedValue(pagina_doc) } })
        const res = await request(app).post('/api/v1/modifica_pagina').set("x-access-token", token).send(pagina_doc)
        expect(res.status).toBe(200)
        expect(res.body.successful).toBe(true)
    })

    it('POST /api/v1/modifica_pagina dal profilo del terapeuta', async()=>{
        Pagina.findOne= jest.fn().mockImplementation(() => { return { exec: jest.fn().mockResolvedValue(pagina_doc) } })
        Pagina.findOneAndUpdate= jest.fn().mockImplementation(() => { return { exec: jest.fn().mockResolvedValue(pagina_doc) } })
        const res = await request(app).post('/api/v1/modifica_pagina').set("x-access-token", token_g).send(pagina_doc)
        expect(res.status).toBe(403)
        expect(res.body.successful).toBe(false)
    })

    it('POST /api/v1/modifica_pagina senza tutti gli attributi', async()=>{
        Pagina.findOne= jest.fn().mockImplementation(() => { return { exec: jest.fn().mockResolvedValue(pagina_doc) } })
        Pagina.findOneAndUpdate= jest.fn().mockImplementation(() => { return { exec: jest.fn().mockResolvedValue(pagina_doc) } })
        const res = await request(app).post('/api/v1/modifica_pagina').set("x-access-token", token).send({testo:"ciao"})
        expect(res.status).toBe(400)
        expect(res.body.successful).toBe(false)
    })

    it('POST /api/v1/modifica_pagina che non esiste', async()=>{
        Pagina.findOne= jest.fn().mockImplementation(() => { return { exec: jest.fn().mockResolvedValue(false) } })
        
        const res = await request(app).post('/api/v1/modifica_pagina').set("x-access-token", token).send(pagina_doc)
        expect(res.status).toBe(400)
        expect(res.body.successful).toBe(false)
    })


    it('POST /api/v1/elimina_pagina ok', async()=>{
        Pagina.findOneAndDelete= jest.fn().mockImplementation(() => { return { exec: jest.fn().mockResolvedValue(pagina_doc) } })
        Diario.findOneAndUpdate= jest.fn().mockImplementation(() => { return { exec: jest.fn().mockResolvedValue(diario_doc) } })
        
        const res = await request(app).post('/api/v1/elimina_pagina').set("x-access-token", token).send(pagina_doc)
        expect(res.status).toBe(200)
        expect(res.body.successful).toBe(true)
    })

   
    it('POST /api/v1/elimina_pagina dal profilo terapeuta', async()=>{
        Pagina.findOneAndDelete= jest.fn().mockImplementation(() => { return { exec: jest.fn().mockResolvedValue(pagina_doc) } })
        Diario.findOneAndUpdate= jest.fn().mockImplementation(() => { return { exec: jest.fn().mockResolvedValue(diario_doc) } })
        
        const res = await request(app).post('/api/v1/elimina_pagina').set("x-access-token", token_g).send(pagina_doc)
        expect(res.status).toBe(403)
        expect(res.body.successful).toBe(false)
    })

    it('POST /api/v1/elimina_pagina che non esiste ', async()=>{
        Pagina.findOneAndDelete= jest.fn().mockImplementation(() => { return { exec: jest.fn().mockResolvedValue(null) } })
        
        const res = await request(app).post('/api/v1/elimina_pagina').set("x-access-token", token).send(pagina_doc)
        expect(res.status).toBe(400)
        expect(res.body.successful).toBe(false)
    })

    it('POST /api/v1/elimina_pagina senza campi', async()=>{
        Pagina.findOneAndDelete= jest.fn().mockImplementation(() => { return { exec: jest.fn().mockResolvedValue(pagina_doc) } })
        
        const res = await request(app).post('/api/v1/elimina_pagina').set("x-access-token", token).send()
        expect(res.status).toBe(400)
        expect(res.body.successful).toBe(false)
    })










})

