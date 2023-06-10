import request from 'supertest'
import { app } from '../server'
import mongoose from 'mongoose'
import bcrypt from 'bcrypt'
import { createToken } from '../controllers/controller_auth'
import { JWTToken } from '../schemas/token_schema'

import { Utente } from '../schemas/utente_schema'

describe("test /api/v1/cambio_password",()=>{
    let mario_doc:any
    let token = createToken('123','mario_rossi',1)

    beforeEach(()=>{
        mario_doc={
            _id:"123",
            username:"mario",
            password:bcrypt.hashSync("ABCabc123$",parseInt(process.env.SALT_ROUNDS)),
            ruolo:1,
            nome:"mario",
            cognome:"rossi",
            email:"mariorossi@gmail.com",
            codice_fiscale: "RSSMRA",
            foto_profilo:"",
            data_nascita:"2020",
            associato:"321"
        }

        mongoose.connect= jest.fn().mockImplementation((conn_string)=>Promise.resolve(true)) //bypass del connect
        JWTToken.find = jest.fn().mockImplementation((criteria)=>{return{exec:jest.fn().mockResolvedValue([])}})//assumiamo il token non blacklisted
        Utente.findById=jest.fn().mockImplementation((_id)=>{return {exec:jest.fn().mockResolvedValue(mario_doc)}})
    })
    afterEach(()=>{
        jest.clearAllMocks().restoreAllMocks()
    })

    it('POST /api/v1/cambio_password di un utente autenticato con nuova password',async()=>{
        Utente.findByIdAndUpdate=jest.fn().mockImplementation((_id)=>{return{exec:jest.fn().mockResolvedValue(mario_doc)}})

        const res = await request(app).post('/api/v1/cambio_password/').set("x-access-token",token).send({
            password:"AAA1b3CCC$"
        })
        expect(res.status).toBe(200)
    })
    
    it('POST /api/v1/cambio_password di autente autenticato con password uguale alla vecchia',async () => {
        Utente.findByIdAndUpdate=jest.fn().mockImplementation((_id,pass)=>{return{exec:jest.fn().mockResolvedValue(mario_doc)}})

        const res = await request(app).post('/api/v1/cambio_password/').set("x-access-token",token).send({
            password:"ABCabc123$"
        })
        expect(res.status).toBe(409)
    })
})