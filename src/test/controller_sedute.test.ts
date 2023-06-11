import request from 'supertest'
import { app } from '../server'
import mongoose from 'mongoose'

import { Cliente } from '../schemas/cliente_schema'
import { Terapeuta } from '../schemas/terapeuta_schema'
import { Utente } from '../schemas/utente_schema'
import { createToken } from '../controllers/controller_auth'
import { JWTToken } from '../schemas/token_schema'
import { Seduta } from '../schemas/seduta_schema'

describe('test sedute', () => {
    let mario_doc: any
    let giovi_doc: any
    let tommy_doc: any
    let seduta_doc: any
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
            n_gettoni:1
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

        tommy_doc = {
            _id: "111",
            username: "tommy",
            password: "abcABC123$$",
            ruolo: 2,
            nome: "Tommaso",
            cognome: "Stella",
            email: "tommasostella@gmail.com",
            codice_fiscale: "STLTMM",
            foto_profilo: "",
            data_nascita: "2020",
            associati: ["123"]
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
        Seduta.create = jest.fn().mockImplementation((doc) => Promise.resolve(true))
    })



    afterEach(() => {
        jest.restoreAllMocks().clearAllMocks()
    })


    it('POST /api/v1/definisci_slot correttamente', async () => {

        Seduta.findOne = jest.fn().mockImplementation((data) => { return { exec: jest.fn().mockResolvedValue(null) } })
        Terapeuta.findById = jest.fn().mockImplementation((_id, filter) => { return { exec: jest.fn().mockResolvedValue(giovi_doc) } })

        const res = await request(app).post('/api/v1/definisci_slot').set("x-access-token", token_g).send(seduta_doc)
        expect(res.status).toBe(200)
        expect(res.body.successful).toBe(true)

    })


    it('POST /api/v1/definisci_slot nel passato', async () => {

        Seduta.findOne = jest.fn().mockImplementation((data) => { return { exec: jest.fn().mockResolvedValue(null) } })
        Terapeuta.findById = jest.fn().mockImplementation((_id, filter) => { return { exec: jest.fn().mockResolvedValue(giovi_doc) } })

        const res = await request(app).post('/api/v1/definisci_slot').set("x-access-token", token_g).send({
            data: "2022-06-30T12:00:00.000+00:00",
            presenza: true
        })
        expect(res.status).toBe(400)
        expect(res.body.successful).toBe(false)

    })

    it('POST /api/v1/definisci_slot senza tutti gli attributi', async () => {

        Seduta.findOne = jest.fn().mockImplementation((data) => { return { exec: jest.fn().mockResolvedValue(null) } })
        Terapeuta.findById = jest.fn().mockImplementation((_id, filter) => { return { exec: jest.fn().mockResolvedValue(giovi_doc) } })

        const res = await request(app).post('/api/v1/definisci_slot').set("x-access-token", token_g).send({
            data: "2022-06-30T12:00:00.000+00:00"
        })
        expect(res.status).toBe(400)
        expect(res.body.successful).toBe(false)

    })

    it('POST /api/v1/definisci_slot con profilo cliente', async () => {

        Seduta.findOne = jest.fn().mockImplementation((data) => { return { exec: jest.fn().mockResolvedValue(null) } })
        Terapeuta.findById = jest.fn().mockImplementation((_id, filter) => { return { exec: jest.fn().mockResolvedValue(giovi_doc) } })

        const res = await request(app).post('/api/v1/definisci_slot').set("x-access-token", token).send({
            data: "2022-06-30T12:00:00.000+00:00"
        })
        expect(res.status).toBe(403)
        expect(res.body.successful).toBe(false)

    })




    it('POST /api/v1/definisci_slot ok', async () => {

        Seduta.findOne = jest.fn().mockImplementation((data) => { return { exec: jest.fn().mockResolvedValue(null) } })
        Terapeuta.findById = jest.fn().mockImplementation((_id, filter) => { return { exec: jest.fn().mockResolvedValue(giovi_doc) } })

        const res = await request(app).post('/api/v1/definisci_slot').set("x-access-token", token_g).send(seduta_doc)
        expect(res.status).toBe(200)
        expect(res.body.successful).toBe(true)

    })




    it('GET /calendario completo del terapeuta', async () => {
        Seduta.find = jest.fn().mockImplementation(() => { return { exec: jest.fn().mockResolvedValue(seduta_doc) } })
        const res = await request(app).get('/api/v1/calendario').set("x-access-token", token_g).send()
        expect(res.status).toBe(200)
        expect(res.body.successful).toBe(true)
    })

    it('GET /calendario completo del cliente', async () => {

        Seduta.find = jest.fn().mockImplementation(() => { return { exec: jest.fn().mockResolvedValue(seduta_doc) } })
        const res = await request(app).get('/api/v1/calendario').set("x-access-token", token).send()
        expect(res.status).toBe(200)
        expect(res.body.successful).toBe(true)
    })

    it('GET /calendario/disponibili del cliente', async () => {

        Cliente.findById = jest.fn().mockImplementation((_id, filter) => { return { exec: jest.fn().mockResolvedValue(mario_doc) } })

        Seduta.find = jest.fn().mockImplementation(() => { return { exec: jest.fn().mockResolvedValue(seduta_doc) } })
        const res = await request(app).get('/api/v1/calendario/disponibili').set("x-access-token", token).send()
        expect(res.status).toBe(200)
        expect(res.body.successful).toBe(true)
    })

    it('GET /calendario/prenotate ok', async () => {
        Seduta.find = jest.fn().mockImplementation(() => { return { exec: jest.fn().mockResolvedValue(seduta_doc) } })
        const res = await request(app).get('/api/v1/calendario/prenotate').set("x-access-token", token).send()
        expect(res.status).toBe(200)
        expect(res.body.successful).toBe(true)
    })



    it('GET /calendario/disponibili del terapeuta', async () => {
        Seduta.find = jest.fn().mockImplementation(() => { return { exec: jest.fn().mockResolvedValue(seduta_doc) } })
        const res = await request(app).get('/api/v1/calendario/disponibili').set("x-access-token", token_g).send()
        expect(res.status).toBe(200)
        expect(res.body.successful).toBe(true)
    })

    it('POST prenota_seduta ok ', async () => {

        Cliente.findById = jest.fn().mockImplementation((_id, filter) => { return { exec: jest.fn().mockResolvedValue(mario_doc) } })
        Seduta.findOneAndUpdate = jest.fn().mockImplementation(() => { return { exec: jest.fn().mockResolvedValue(seduta_doc) } })
        Cliente.findOneAndUpdate = jest.fn().mockImplementation(() => { return { exec: jest.fn().mockResolvedValue(mario_doc) } })

        const res = await request(app).post('/api/v1/prenotazione').set("x-access-token", token).send({
            data: "2023-06-30T12:00:00.000+00:00"
        })
        expect(res.status).toBe(200)
        expect(res.body.successful).toBe(true)
    })


    it('POST prenota_seduta con profilo terapeuta ', async () => {

        Cliente.findById = jest.fn().mockImplementation((_id, filter) => { return { exec: jest.fn().mockResolvedValue(mario_doc) } })
        Seduta.findOneAndUpdate = jest.fn().mockImplementation(() => { return { exec: jest.fn().mockResolvedValue(seduta_doc) } })
        Cliente.findOneAndUpdate = jest.fn().mockImplementation(() => { return { exec: jest.fn().mockResolvedValue(mario_doc) } })

        const res = await request(app).post('/api/v1/prenotazione').set("x-access-token", token_g).send({
            data: "2023-06-30T12:00:00.000+00:00"
        })
        expect(res.status).toBe(403)
        expect(res.body.successful).toBe(false)
    })

    it('POST /definisci_slot/elimina con profilo terapeuta ', async () => {

        Cliente.findById = jest.fn().mockImplementation((_id, filter) => { return { exec: jest.fn().mockResolvedValue(mario_doc) } })
        Seduta.findOneAndDelete = jest.fn().mockImplementation(() => { return { exec: jest.fn().mockResolvedValue(seduta_doc) } })
        Cliente.findOneAndUpdate = jest.fn().mockImplementation(() => { return { exec: jest.fn().mockResolvedValue(mario_doc) } })

        const res = await request(app).post('/api/v1/definisci_slot/elimina').set("x-access-token", token_g).send({
            data: "2023-06-30T12:00:00.000+00:00"
        })
        expect(res.status).toBe(200)
        expect(res.body.successful).toBe(true)
    })

    it('POST /definisci_slot/elimina con profilo cliente ', async () => {

        Cliente.findById = jest.fn().mockImplementation((_id, filter) => { return { exec: jest.fn().mockResolvedValue(mario_doc) } })
        Seduta.findOneAndDelete = jest.fn().mockImplementation(() => { return { exec: jest.fn().mockResolvedValue(seduta_doc) } })
        Cliente.findOneAndUpdate = jest.fn().mockImplementation(() => { return { exec: jest.fn().mockResolvedValue(mario_doc) } })

        const res = await request(app).post('/api/v1/definisci_slot/elimina').set("x-access-token", token).send({
            data: "2023-06-30T12:00:00.000+00:00"
        })
        expect(res.status).toBe(403)
        expect(res.body.successful).toBe(false)
    })

    it('POST /definisci_slot/elimina senza il campo data', async () => {

        Cliente.findById = jest.fn().mockImplementation((_id, filter) => { return { exec: jest.fn().mockResolvedValue(mario_doc) } })
        Seduta.findOneAndDelete = jest.fn().mockImplementation(() => { return { exec: jest.fn().mockResolvedValue(seduta_doc) } })
        Cliente.findOneAndUpdate = jest.fn().mockImplementation(() => { return { exec: jest.fn().mockResolvedValue(mario_doc) } })

        const res = await request(app).post('/api/v1/definisci_slot/elimina').set("x-access-token", token_g).send()
        expect(res.status).toBe(400)
        expect(res.body.successful).toBe(false)
    })


    it('POST /annullaprenotazione ok', async () => {

        Cliente.findById = jest.fn().mockImplementation((_id, filter) => { return { exec: jest.fn().mockResolvedValue(mario_doc) } })
        Seduta.findOneAndUpdate = jest.fn().mockImplementation(() => { return { exec: jest.fn().mockResolvedValue(seduta_doc) } })
        Cliente.findOneAndUpdate = jest.fn().mockImplementation(() => { return { exec: jest.fn().mockResolvedValue(mario_doc) } })

        const res = await request(app).post('/api/v1/annullaprenotazione').set("x-access-token", token).send({
            data: "2023-06-30T12:00:00.000+00:00"
        })
        expect(res.status).toBe(200)
        expect(res.body.successful).toBe(true)
    })

    it('POST /annullaprenotazione senza campo data', async () => {

        Cliente.findById = jest.fn().mockImplementation((_id, filter) => { return { exec: jest.fn().mockResolvedValue(mario_doc) } })
        Seduta.findOneAndUpdate = jest.fn().mockImplementation(() => { return { exec: jest.fn().mockResolvedValue(seduta_doc) } })
        Cliente.findOneAndUpdate = jest.fn().mockImplementation(() => { return { exec: jest.fn().mockResolvedValue(mario_doc) } })

        const res = await request(app).post('/api/v1/annullaprenotazione').set("x-access-token", token).send()
        expect(res.status).toBe(400)
        expect(res.body.successful).toBe(false)
    })


})

