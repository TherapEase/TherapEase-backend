import request from 'supertest'
import { app } from '../server'
import { describe } from 'node:test'
import { Utente, IUtente } from '../schemas/utente_schema'
import mongoose from 'mongoose'
import { Cliente } from '../schemas/cliente_schema'
import { Terapeuta } from '../schemas/terapeuta_schema'
import jwt from 'jsonwebtoken'
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


describe('POST /api/v1/registrazione, api/v1/login e api/v1/conferma_mail',()=>{
    /**
     * Su <BASE>/registrazione inserisci i dati richiesti, ovvero
     *  {username: "mario_rossi",
     *  password:"abcABC123$",
     *  email:"mario.rossi@gmail.com",
     *  nome:"mario", cognome:"rossi",
     *  cf:"RSSMRA70A01H501S", data_nascita:"01/01/1970",
     *  ruolo:"1"}
     * 
     *  mario rossi non deve essere registrato
     * 
     *  il provesso termina HTTP 200 OK e viene restituito un token
     */
    let mario_doc:any
    let giovi_doc:any
    beforeEach(async()=>{
        mario_doc ={
            _id:123,
            username:"mario",
            password:"abcABC123$$",
            ruolo:1,
            nome:"mario",
            cognome:"rossi",
            email:"mariorossi@gmail.com",
            mail_confermata:false,
            codice_fiscale: "RSSMRA",
            foto_profilo:"img",
            data_nascita:"2020"
        }

        giovi_doc ={
            _id:321,
            username:"giovi",
            password:"abcABC123$$",
            ruolo:2,
            nome:"Giovanna",
            cognome:"Bianchi",
            email:"giovannabianchi@gmail.com",
            mail_confermata:false,
            codice_fiscale: "BNCGVN",
            foto_profilo:"img",
            data_nascita:"2020",
            documenti:["a","b"],
            limite_clienti:10,
            indirizzo:"Trento"
        }

        mongoose.connect= jest.fn().mockImplementation((conn_string)=>Promise.resolve(true)) //bypass del connect
        Utente.findOne = jest.fn().mockImplementation(()=>{return{exec:jest.fn().mockResolvedValue(null)}})
        Cliente.create= jest.fn().mockImplementation((doc)=>Promise.resolve(true)) //bypass della create
        Terapeuta.create= jest.fn().mockImplementation((doc)=>Promise.resolve(true))
    })
    afterEach(()=>{
        jest.restoreAllMocks().clearAllMocks()
    })

    it('POST /registrazione cliente ok',async ()=>{
        
        const res = await request(app).post('/api/v1/registrazione').send(mario_doc)
        expect(res.status).toBe(200)
        expect(res.body).toHaveProperty("token")
    })

    it('POST /registrazione terapeuta ok',async()=>{
        
        const res = await request(app).post('/api/v1/registrazione').send(giovi_doc)
        expect(res.status).toBe(200)
        expect(res.body).toHaveProperty("token")
    })

    it('POST /registrazione utente con ruolo invalido', async()=>{
        mario_doc.ruolo=6
        const res = await request(app).post('/api/v1/registrazione').send(mario_doc)
        expect(res.status).toBe(403)
        expect(res.body.successful).toBe(false)
    })
    
    it('POST /registrazione con campi mancanti',async()=>{
        mario_doc={
            username: "mario_rossi",
            password:"abcABC123$",
            email:"mario.rossi@gmail.com",
            nome:"mario",
            cf:"RSSMRA70A01H501S",
            data_nascita:"01/01/1970"
        }
        const res = await request(app).post('/api/v1/registrazione').send(mario_doc)
        expect(res.status).toBe(400)
    })

    it('POST /registrazione di un utente già registrato',async()=>{
        Utente.findOne = jest.fn().mockImplementation(()=>{return{exec:jest.fn().mockResolvedValue(true)}})

        const res = await request(app).post('/api/v1/registrazione').send(mario_doc)
        expect(res.status).toBe(409)
    })

    it(('POST /login di un utente registrato con campi corretti'),async ()=>{
        Utente.findOne = jest.fn().mockImplementation(()=>{return{exec:jest.fn().mockResolvedValue({
            _id:123,
            username:"mario_rossi",
            password:"$2b$08$eZn3ZBFTgjqO9Y.7IKrEOukAj3nsPbec/gMPwWnV2gim.yhVmawSi",
            ruolo:1
        })}})
        Cliente.findOne = jest.fn().mockImplementation(()=>{return{exec:jest.fn().mockResolvedValue(mario_doc)}})
        Terapeuta.findOne = jest.fn().mockImplementation(()=>{return {exec:jest.fn().mockResolvedValue(giovi_doc)}})
        
        const res = await request(app).post('/api/v1/login').send({
            username:'mario_rossi',
            password:'abcABC123$'
        })
        expect(res.status).toBe(200)
    })

    it(('POST /login senza password'),async()=>{
        const res = await request(app).post('/api/v1/login').send({
            username:"mario_rossi"
        })
        expect(res.status).toBe(400)
    })

    it(('POST /login di un utente non registrato'),async ()=>{
        const res = await request(app).post('/api/v1/login').send({
            username:"patty12",
            password:"!!p4SS!!!"
        })
        expect(res.status).toBe(404)
    })

    it(('POST /login di un utente registrato, password non corretta'),async ()=>{
        Utente.findOne = jest.fn().mockImplementation(()=>{return{exec:jest.fn().mockResolvedValue({
            _id:123,
            username:"mario_rossi",
            password:"$2b$08$eZn3ZBFTgjqO9Y.7IKrEOukAj3nsPbec/gMPwWnV2gim.yhVmawSi",
            ruolo:1
        })}})
        const res = await request(app).post('/api/v1/login').send({
            username:'mario_rossi',
            password:'abcABC123?'
        })
        expect(res.status).toBe(401)
    })
    it('POST /conferma_mail/:ver_token con token valido', async()=>{
        const ver_token= jwt.sign({
            _id:mario_doc._id,
            email: mario_doc.email,
            ruolo: mario_doc.ruolo
        },process.env.TOKEN_SECRET,{expiresIn:"1 day"})
        Cliente.findOneAndUpdate = jest.fn().mockImplementation(()=>{return {exec:jest.fn().mockResolvedValue(mario_doc)}})
        Terapeuta.findOneAndUpdate = jest.fn().mockImplementation(()=>{return {exec:jest.fn().mockResolvedValue(giovi_doc)}})

        const res = await request(app).post('/api/v1/conferma_mail/'+ver_token).send()
        expect(res.status).toBe(200)
    })
    it('POST /conferma_mail/:ver_token senza specificare il token', async()=>{
        const res = await request(app).post('/api/v1/conferma_mail/').send()
        expect(res.status).toBe(404)
    })
    it('POST /conferma_mail/:ver_token con un token non valido',async()=>{
        const ver_token= jwt.sign({
            _id: mario_doc._id
        },"chiavenonvalida")

        const res = await request(app).post('/api/v1/conferma_mail/'+ver_token).send()
        expect(res.status).toBe(403)
    })
    it('POST /conferma_mail/:ver_token con token valido, ma utente non presente', async()=>{
        const ver_token= jwt.sign({
            _id:mario_doc._id,
            email: mario_doc.email,
            ruolo: mario_doc.ruolo
        },process.env.TOKEN_SECRET,{expiresIn:"1 day"})
        Cliente.findOneAndUpdate = jest.fn().mockImplementation(()=>{return {exec:jest.fn().mockResolvedValue(null)}})
        
        const res = await request(app).post('/api/v1/conferma_mail/'+ver_token).send()
        expect(res.status).toBe(404)
    })
})