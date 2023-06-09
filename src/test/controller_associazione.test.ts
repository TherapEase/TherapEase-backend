import request from 'supertest'
import { app } from '../server'
import mongoose from 'mongoose'

import { Cliente } from '../schemas/cliente_schema'
import { Terapeuta } from '../schemas/terapeuta_schema'
import { Utente } from '../schemas/utente_schema'
import { createToken } from '../controllers/controller_auth'
import { JWTToken } from '../schemas/token_schema'
import { Seduta } from '../schemas/seduta_schema'
import { Sessione } from '../schemas/sessione_stripe_schema'

describe('test /api/v1/associazione/:id  api/v1/associazione/rimuovi/:id',()=>{
    
    let mario_doc:any
    let giovi_doc:any
    let tommy_doc:any
    let marco_doc:any
    let seduta_doc: any
    let token = createToken("123","mario",1)
    let token_t= createToken("111","tommy",2)
    let token_g = createToken("321", "giovi", 2)
    //aggiungere anche i controlli per il terapeuta?
    beforeEach(()=>{
        mario_doc={
            _id:"123",
            username:"mario",
            password:"abcABC123$$",
            ruolo:1,
            nome:"mario",
            cognome:"rossi",
            email:"mariorossi@gmail.com",
            codice_fiscale: "RSSMRA",
            foto_profilo:"",
            data_nascita:"2020",
            associato:""
        }
        marco_doc={
            _id:"456",
            username:"marco",
            password:"abcABC123$$",
            ruolo:1,
            nome:"marco",
            cognome:"rossi",
            email:"mariorossi@gmail.com",
            codice_fiscale: "RSSMRA",
            foto_profilo:"",
            data_nascita:"2020",
            associato:"111"
        }
        giovi_doc={
            _id:"321",
            username:"giovi",
            password:"abcABC123$$",
            ruolo:2,
            nome:"Giovanna",
            cognome:"Bianchi",
            email:"giovannabianchi@gmail.com",
            codice_fiscale: "BNCGVN",
            foto_profilo:"",
            data_nascita:"2020",
            associati:[],
            limite_clienti: 25
        }
        tommy_doc={
            _id:"111",
            username:"tommy",
            password:"abcABC123$$",
            ruolo:2,
            nome:"Tommaso",
            cognome:"Stella",
            email:"tommasostella@gmail.com",
            codice_fiscale: "STLTMM",
            foto_profilo:"",
            data_nascita:"2020",
            associati:["456"],
            limite_clienti: 1
        }
        seduta_doc={
            data: "2021",
            presenza: false
        }
        

        mongoose.connect= jest.fn().mockImplementation((conn_string)=>Promise.resolve(true)) //bypass del connect
        JWTToken.find = jest.fn().mockImplementation((criteria)=>{return{exec:jest.fn().mockResolvedValue([])}})//assumiamo il token non blacklisted
        Utente.findById=jest.fn().mockImplementation((_id)=>{return{exec:jest.fn().mockImplementation(()=>{
            if(_id=='123') return Promise.resolve(mario_doc)
            if(_id=='321') return Promise.resolve(giovi_doc)
            if(_id=='111') return Promise.resolve(tommy_doc)
            return Promise.resolve(null)
        })}}) //per il tokenCheck, ritorna mario o giovi in base all'id
    })
    afterEach(()=>{
        jest.restoreAllMocks().clearAllMocks()
    })

    //Un cliente si associa ad un terapeuta. Il terapeuta esiste, il suo limite di clienti non è stato superato e il cliente non è associato a quel terapeuta

    it('POST /api/v1/associazione/id_giovi',async ()=>{
        Cliente.findById = jest.fn().mockImplementation((_id,filter)=>{return{exec:jest.fn().mockResolvedValue(mario_doc)}})
        console.log("trovo cliente, con token: "+token)
        Terapeuta.findById = jest.fn().mockImplementation((_id,filter)=>{return{exec:jest.fn().mockResolvedValue(giovi_doc)}})
        console.log("trovo terapeuta con id: "+giovi_doc._id)

        Cliente.findByIdAndUpdate = jest.fn().mockImplementation((_id,filter)=>{return{exec:jest.fn().mockResolvedValue(mario_doc)}})
        Terapeuta.findByIdAndUpdate = jest.fn().mockImplementation((_id,filter)=>{return{exec:jest.fn().mockResolvedValue(giovi_doc)}})

        Seduta.updateMany = jest.fn().mockImplementation((_id,filter)=>{return{exec:jest.fn().mockResolvedValue(seduta_doc)}})
        Seduta.findOneAndUpdate = jest.fn().mockImplementation((_id,filter)=>{return{exec:jest.fn().mockResolvedValue(seduta_doc)}})

        Cliente.findOneAndUpdate = jest.fn().mockImplementation((_id,filter)=>{return{exec:jest.fn().mockResolvedValue(mario_doc)}})

        const res = await request(app).post('/api/v1/associazione/'+giovi_doc._id).set("x-access-token",token).send({
            username:"mario",
            password:"abcABC123$$",
            ruolo:1,
            nome:"mario",
            cognome:"rossi",
            email:"mariorossi@gmail.com",
            codice_fiscale: "RSSMRA",
            foto_profilo:"",
            data_nascita:"2020",
            associato:"321"
        })
        console.log(JSON.stringify(giovi_doc))
        
        expect(res.status).toBe(200)
    })

    //Un cliente si vuole associare a un terapeuta ma non lo specifica nella richiesta   

    it('POST /api/v1/associazione/id_tommy',async ()=>{
        Cliente.findById = jest.fn().mockImplementation((_id,filter)=>{return{exec:jest.fn().mockResolvedValue(mario_doc)}})
        //Terapeuta.findById = jest.fn().mockImplementation((_id,filter)=>{return{exec:jest.fn().mockResolvedValue(tommy_doc)}})
        //const fake_id = "000"
        const res = await request(app).post('/api/v1/associazione').set("x-access-token",token).send()
        expect(res.status).toBe(404)
    })

    //Un cliente si associa ad un terapeuta. Il terapeuta esiste e il suo limite di clienti non è stato superato. Il cliente però è gia associato a quel terapeuta

    it('POST /api/v1/associazione/id_tommy ',async ()=>{
        Cliente.findById = jest.fn().mockImplementation((_id,filter)=>{return{exec:jest.fn().mockResolvedValue(mario_doc)}})
        Terapeuta.findById = jest.fn().mockImplementation((_id,filter)=>{return{exec:jest.fn().mockResolvedValue(tommy_doc)}})

        const res = await request(app).post('/api/v1/associazione/'+tommy_doc._id).set("x-access-token",token).send({associati: ["123"]})
        expect(res.status).toBe(409)
    })

    //Un cliente si associa ad un terapeuta. Il terapeuta esiste ma il suo limite di clienti è stato superato

    it('POST /api/v1/associazione/id_tommy ',async ()=>{
        Cliente.findById = jest.fn().mockImplementation((_id,filter)=>{return{exec:jest.fn().mockResolvedValue(mario_doc)}})
        Terapeuta.findById = jest.fn().mockImplementation((_id,filter)=>{return{exec:jest.fn().mockResolvedValue(tommy_doc)}})

        const res = await request(app).post('/api/v1/associazione/'+tommy_doc._id).set("x-access-token",token).send()
        expect(res.status).toBe(409)
    })

    //Un utente fa la dissociazione da un altro utente esistente al quale è associato

    it('POST /api/v1/associazione/rimuovi/id',async ()=>{
        Cliente.findById = jest.fn().mockImplementation((_id,filter)=>{return{exec:jest.fn().mockResolvedValue(marco_doc)}})
        Terapeuta.findById = jest.fn().mockImplementation((_id,filter)=>{return{exec:jest.fn().mockResolvedValue(tommy_doc)}})
        Cliente.findByIdAndUpdate = jest.fn().mockImplementation((_id,filter)=>{return{exec:jest.fn().mockResolvedValue(marco_doc)}})
        Terapeuta.findByIdAndUpdate = jest.fn().mockImplementation((_id,filter)=>{return{exec:jest.fn().mockResolvedValue(tommy_doc)}})

        Seduta.updateMany = jest.fn().mockImplementation((_id,filter)=>{return{exec:jest.fn().mockResolvedValue(seduta_doc)}})
        Seduta.findOneAndUpdate = jest.fn().mockImplementation((_id,filter)=>{return{exec:jest.fn().mockResolvedValue(seduta_doc)}})

        Cliente.findOneAndUpdate = jest.fn().mockImplementation((_id,filter)=>{return{exec:jest.fn().mockResolvedValue(marco_doc)}})

        const res = await request(app).post('/api/v1/associazione/rimuovi'+tommy_doc._id).set("x-access-token",token).send()
        expect(res.status).toBe(200)
    })

    //Un utente fa la dissociazione da un altro utente, che però non esiste
    it('POST /api/v1/associazione/rimuovi/id ',async ()=>{
        Cliente.findById = jest.fn().mockImplementation((_id,filter)=>{return{exec:jest.fn().mockResolvedValue(mario_doc)}})
        Terapeuta.findById = jest.fn().mockImplementation((_id,filter)=>{return{exec:jest.fn().mockResolvedValue(giovi_doc)}})

        Cliente.findByIdAndUpdate = jest.fn().mockImplementation((_id,filter)=>{return{exec:jest.fn().mockResolvedValue(mario_doc)}})
        Terapeuta.findByIdAndUpdate = jest.fn().mockImplementation((_id,filter)=>{return{exec:jest.fn().mockResolvedValue(giovi_doc)}})

        Seduta.updateMany = jest.fn().mockImplementation((_id,filter)=>{return{exec:jest.fn().mockResolvedValue(seduta_doc)}})
        Seduta.findOneAndUpdate = jest.fn().mockImplementation((_id,filter)=>{return{exec:jest.fn().mockResolvedValue(seduta_doc)}})

        Cliente.findOneAndUpdate = jest.fn().mockImplementation((_id,filter)=>{return{exec:jest.fn().mockResolvedValue(mario_doc)}})
        const res = await request(app).post('/api/v1/associazione/rimuovi/').set("x-access-token",token).send()
        expect(res.status).toBe(404)
    })





    
})