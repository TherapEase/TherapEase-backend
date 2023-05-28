import request from 'supertest'
import { app } from '../server'
import { describe } from 'node:test'
import { Utente, IUtente } from '../schemas/utente_schema'
import mongoose, { Document, FilterQuery,Query } from 'mongoose'

describe('GET /api/v1/', ()=>{

    let UtenteSpy:jest.SpyInstance

    beforeAll(()=>{
        //UtenteSpy = jest.spyOn(Utente,'findOne').mockImplementation()

        /**
         * 
         * Le query vengono eseguite come Utente.findOne(...).exec() ciò significa che:
         *  findOne deve avere un campo exec
         *  il campo exec corrisponde ad exec() e ritorna una promise con i valori
         * 
         *  quindi bisogna dare una finta implementazione a findOne in cui viene restituito exec
         *  exec a sua volta viene fintamente implementato restituendo la promise
         * 
         */
        Utente.findOne = jest.fn().mockImplementation(()=>{return{exec:jest.fn().mockResolvedValue({
            _id:123,
            username:"mario_rossi",
            password:"$2b$08$eZn3ZBFTgjqO9Y.7IKrEOukAj3nsPbec/gMPwWnV2gim.yhVmawSi",
            ruolo:1
        })}})

    })
    afterAll(async()=>{
        jest.resetAllMocks().clearAllMocks()
    })
    test(('POST /login senza password'),async()=>{
        const res = await request(app).post('/api/v1/login').send({
            username:"mario_rossi"
        })
        expect(res.status).toBe(400)
    })
    test(('POST /login ok'),async ()=>{
        const res = await request(app).post('/api/v1/login').send({
            username:'mario_rossi',
            password:'abcABC123$'
        })
        expect(res.status).toBe(200)
    })
})