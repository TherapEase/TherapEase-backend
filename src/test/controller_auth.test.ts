import request from 'supertest'
import { app } from '../server'
import { describe } from 'node:test'
import { Utente, IUtente } from '../schemas/utente_schema'

describe('GET /api/v1/', ()=>{
    test(('POST /login senza password'),async()=>{

        const res = await request(app).post('/api/v1/login').send({
            username:"mario_rossi"
        })
        expect(res.status).toBe(400)
    })
})