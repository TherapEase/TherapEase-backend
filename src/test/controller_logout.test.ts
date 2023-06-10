import request from 'supertest'
import { app } from '../server'
import mongoose from 'mongoose'

import { Cliente } from '../schemas/cliente_schema'
import { Terapeuta } from '../schemas/terapeuta_schema'
import { Utente } from '../schemas/utente_schema'
import { createToken } from '../controllers/controller_auth'
import { JWTToken } from '../schemas/token_schema'






describe('test diario', () => {
    let mario_doc: any
    let giovi_doc: any
    // let diario_doc: any
    // let seduta_doc: any
    // let pagina_doc: any

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

        // seduta_doc = {
        //     data: "2023-06-30T12:00:00.000+00:00",
        //     presenza: true
        // }



        // pagina_doc = {
        //     _id: "11",
        //     data: "2023-05-30T12:00:00.000+00:00",
        //     testo: "ciao",

        // }

        // diario_doc = {
        //     _id: "1",
        //     pagine: ["11", "22"],
        //     cliente: "123"
        // }





        mongoose.connect = jest.fn().mockImplementation((conn_string) => Promise.resolve(true)) //bypass del connect
        JWTToken.create = jest.fn().mockImplementation(() => Promise.resolve(true))
        
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



    it('POST /api/v1/logout con profilo cliente', async () => {
        
        const res = await request(app).post('/api/v1/logout').set("x-access-token", token).send()
        expect(res.status).toBe(200)
        expect(res.body.successful).toBe(true)
    })

    it('POST /api/v1/logout senza essere loggati', async () => {
        
        const res = await request(app).post('/api/v1/logout').send()
        expect(res.status).toBe(400)
        expect(res.body.successful).toBe(false)
    })

})

