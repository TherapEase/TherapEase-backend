import request from 'supertest'
import { app } from '../server'
import { describe } from 'node:test'
import { Utente, IUtente } from '../schemas/utente_schema'
import { FilterQuery } from 'mongoose'

describe('GET /api/v1/', ()=>{

    // let UtenteSpy:jest.SpyInstance

    // beforeAll(()=>{
    //     UtenteSpy = jest.spyOn(Utente,'findOne').mockImplementation((criterias):any=>{
    //         return {
    //             _id:"646a5a022d917ee699025609",
    //             username: 'mario_rossi',
    //             password: '$2b$08$eZn3ZBFTgjqO9Y.7IKrEOukAj3nsPbec/gMPwWnV2gim.yhVmawSi',
    //             ruolo:1
    //         }
    //     })
    // })
    // afterAll(async()=>{
    //     UtenteSpy.mockRestore()
    // })
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