import request from 'supertest'
import { app } from '../server'
import mongoose from 'mongoose'
import jwt from 'jsonwebtoken'

import { Cliente } from '../schemas/cliente_schema'
import { Terapeuta } from '../schemas/terapeuta_schema'
import { createToken } from '../controllers/controller_auth'

describe('test /api/v1/il_mio_profilo /api/v1/il_mio_profilo/modifica /api/v1/profilo/:id ',()=>{
    
    let mario_doc:any
    let token = createToken("123","mario_rossi",1)

    beforeEach(()=>{
        mongoose.connect= jest.fn().mockImplementation((conn_string)=>Promise.resolve(true)) //bypass del connect
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
    })
    afterEach(()=>{
        jest.restoreAllMocks().clearAllMocks()
    })

    it('GET /api/v1/il_mio_profilo di un utente autenticato',async ()=>{
        Cliente.findById = jest.fn().mockImplementation((_id,filter)=>{exec:jest.fn().mockResolvedValue(mario_doc)})
        const res = await request(app).get('/api/v1/il_mio_profilo').set("x-access-token",token).send()

        expect(res.status).toBe(200)
    })
})