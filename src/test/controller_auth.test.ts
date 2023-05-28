import request from 'supertest'
import { app } from '../server'
import { after, describe } from 'node:test'
import { Utente, IUtente } from '../schemas/utente_schema'
import mongoose, { Document, FilterQuery,Query } from 'mongoose'

describe('POST /api/v1/registrazione',()=>{
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
    beforeAll(()=>{
        //mongoose.Document.prototype.save = jest.fn().mockImplementation(()=>{Promise.resolve(true)})
        //Utente.prototype.save = jest.fn().mockImplementation(()=>{Promise.resolve(true)})
        jest.spyOn(Utente.prototype,"save").mockResolvedValue(true)
    })
    const mario_doc ={
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
    afterAll(()=>{
        //jest.restoreAllMocks().clearAllMocks()
    })

    it('POST /registrazione ok',async ()=>{
        //mario rossi non è registrato: la ricerca torna un valore falsy
        Utente.findOne = jest.fn().mockImplementation(()=>{return{exec:jest.fn().mockResolvedValue(null)}})
        //mockingoose(Utente).toReturn({},"findOne")
        //non vogliamo che venga salvato sul db
        //mockingoose(Utente).toReturn(true,"save")
        
        

        const res = await request(app).post('/api/v1/registrazione').send(mario_doc)
        console.log(res.body.message)
        expect(res.status).toBe(200)
        expect(res.body).toHaveProperty("token")
    })
})



describe('POST /api/v1/login', ()=>{

    //let UtenteSpy:jest.SpyInstance

    beforeAll(()=>{
        //UtenteSpy = jest.spyOn(Utente,'findOne').mockImplementation()


    })
    afterAll(async()=>{
        //jest.resetAllMocks().clearAllMocks()
    })
    it(('POST /login senza password'),async()=>{
        const res = await request(app).post('/api/v1/login').send({
            username:"mario_rossi"
        })
        expect(res.status).toBe(400)
    })
    it(('POST /login ok'),async ()=>{

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
        const res = await request(app).post('/api/v1/login').send({
            username:'mario_rossi',
            password:'abcABC123$'
        })
        console.log(res.body.message)
        expect(res.status).toBe(200)
    })
})