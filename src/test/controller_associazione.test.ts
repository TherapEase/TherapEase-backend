import request from 'supertest'
import { app } from '../server'
import mongoose from 'mongoose'

import { Cliente } from '../schemas/cliente_schema'
import { Terapeuta } from '../schemas/terapeuta_schema'
import { Utente } from '../schemas/utente_schema'
import { createToken } from '../controllers/controller_auth'
import { JWTToken } from '../schemas/token_schema'
import { Seduta } from '../schemas/seduta_schema'

describe('test /api/v1/associazione/:id  api/v1/associazione/rimuovi/:id',()=>{
    
    let mario_doc:any
    let giovi_doc:any
    let mario_up_doc:any
    let giovi_up_doc:any
    let tommy_doc:any
    let marco_doc:any
    let admin_doc:any
    let seduta_doc: any
    let token = createToken("123","mario",1)
    let token_ad = createToken("777", "admin",4)
    let token_marco = createToken( "456", "marco", 1)
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
        mario_up_doc={
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
            associato:"321"
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
        giovi_up_doc={
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
            associati:["123"],
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
            presenza: false,
            cliente:"",
            terapeuta: "321",
            indirizzo:""
        },
        admin_doc ={
            _id:"777",
            usernmane: "admin",
            password: "abcABC123$?",
            ruolo:4
        }
        

        mongoose.connect= jest.fn().mockImplementation((conn_string)=>Promise.resolve(true)) 
        JWTToken.find = jest.fn().mockImplementation((criteria)=>{return{exec:jest.fn().mockResolvedValue([])}})//assumiamo il token non blacklisted
        Utente.findById=jest.fn().mockImplementation((_id)=>{return{exec:jest.fn().mockImplementation(()=>{
            if(_id=='123') return Promise.resolve(mario_doc)
            if(_id=='321') return Promise.resolve(giovi_doc)
            if(_id=='111') return Promise.resolve(tommy_doc)
            if(_id=='777') return Promise.resolve(admin_doc)
            return Promise.resolve(null)
        })}}) //per il tokenCheck, ritorna mario o giovi in base all'id
        Seduta.updateMany = jest.fn().mockImplementation((criteria)=>{return{exec:jest.fn().mockResolvedValue([seduta_doc])}})
    })
    afterEach(()=>{
        jest.restoreAllMocks().clearAllMocks()
    })

    //Un cliente si associa ad un terapeuta. Il terapeuta esiste, il suo limite di clienti non è stato superato e il cliente non è associato a quel terapeuta
    it('POST /api/v1/associazione/id_giovi correttamente',async ()=>{
        Terapeuta.findById = jest.fn().mockImplementation((_id,filter)=>{return{exec:jest.fn().mockResolvedValue(giovi_doc)}})
        Cliente.findById = jest.fn().mockImplementation((_id,filter)=>{return{exec:jest.fn().mockResolvedValue(mario_doc)}})

        Cliente.findByIdAndUpdate = jest.fn().mockImplementation((_id,filter)=>{return{exec:jest.fn().mockResolvedValue(mario_up_doc)}})
        Terapeuta.findByIdAndUpdate = jest.fn().mockImplementation((_id,filter)=>{return{exec:jest.fn().mockResolvedValue(giovi_up_doc)}})

        const res = await request(app).post('/api/v1/associazione/'+giovi_doc._id).set("x-access-token",token).send()
        expect(res.status).toBe(200)
    })

    //Un cliente si vuole associare a un terapeuta ma non lo specifica nella richiesta   
    it('POST /api/v1/associazione/  senza specificare id-> non trova la route',async ()=>{
        Cliente.findById = jest.fn().mockImplementation((_id,filter)=>{return{exec:jest.fn().mockResolvedValue(mario_doc)}})

        const res = await request(app).post('/api/v1/associazione').set("x-access-token",token).send()
        expect(res.status).toBe(404)
    })

    //Un cliente si associa ad un terapeuta. Il terapeuta esiste e il suo limite di clienti non è stato superato. Il cliente però è gia associato a quel terapeuta
    it('POST /api/v1/associazione/:id limite clienti superato, cliente gia associato',async ()=>{
        Cliente.findById = jest.fn().mockImplementation((_id,filter)=>{return{exec:jest.fn().mockResolvedValue(marco_doc)}})
        Terapeuta.findById = jest.fn().mockImplementation((_id,filter)=>{return{exec:jest.fn().mockResolvedValue(tommy_doc)}})

        const res = await request(app).post('/api/v1/associazione/'+tommy_doc._id).set("x-access-token",token).send()
        expect(res.status).toBe(409)
    })

    //Un cliente si associa ad un terapeuta. Il terapeuta esiste ma il suo limite di clienti è stato superato
    it('POST /api/v1/associazione/id_tommy limite clienti superato',async ()=>{
        Cliente.findById = jest.fn().mockImplementation((_id,filter)=>{return{exec:jest.fn().mockResolvedValue(mario_doc)}})
        Terapeuta.findById = jest.fn().mockImplementation((_id,filter)=>{return{exec:jest.fn().mockResolvedValue(tommy_doc)}})

        const res = await request(app).post('/api/v1/associazione/'+tommy_doc._id).set("x-access-token",token_t).send()
        expect(res.status).toBe(409)
    })

    
    // RIMUOVI ASSOCIAZIONE

    // Un utente fa la dissociazione da un altro utente esistente al quale è associato
    it('DELETE /api/v1/associazione/rimuovi/:id',async ()=>{
        Cliente.findOne = jest.fn().mockImplementation((criteria)=>{return{exec:jest.fn().mockResolvedValue(mario_up_doc)}})
        Terapeuta.findOne = jest.fn().mockImplementation((criteria)=>{return{exec:jest.fn().mockResolvedValue(giovi_up_doc)}})
        
        Cliente.findOneAndUpdate = jest.fn().mockImplementation((_id,filter)=>{return{exec:jest.fn().mockResolvedValue(mario_doc)}})
        Terapeuta.findOneAndUpdate = jest.fn().mockImplementation((_id,filter)=>{return{exec:jest.fn().mockResolvedValue(giovi_doc)}})
        Cliente.findById = jest.fn().mockImplementation((_id)=>{return{exec:jest.fn().mockResolvedValue(mario_doc)}})

        const res = await request(app).delete('/api/v1/associazione/rimuovi/'+giovi_doc._id).set("x-access-token",token).send()
        expect(res.status).toBe(200)
    })

    // //Un utente fa la dissociazione da un altro utente, che però non esiste
    it('DELETE /api/v1/associazione/rimuovi/:id terapeuta non esistente',async ()=>{
        Cliente.findOne = jest.fn().mockImplementation((criteria)=>{return{exec:jest.fn().mockResolvedValue(mario_up_doc)}})
        Terapeuta.findOne = jest.fn().mockImplementation((criteria)=>{return{exec:jest.fn().mockResolvedValue(null)}})
        
        const res = await request(app).delete('/api/v1/associazione/rimuovi/1111').set("x-access-token",token).send()
        expect(res.status).toBe(404)
    })

    it('DELETE /api/v1/associazione/rimuovi/:id ruolo non valido',async ()=>{
       const res = await request(app).delete('/api/v1/associazione/rimuovi/'+giovi_doc._id).set("x-access-token",token_ad).send()
        expect(res.status).toBe(403)
    })

    it('GET /api/v1/catalogo_associati corretto',async() => {
        Cliente.find = jest.fn().mockImplementation((criteria)=>{return{exec:jest.fn().mockResolvedValue([mario_up_doc])}})
        const res = await request(app).get('/api/v1/catalogo_associati').set("x-access-token",token_t).send()
        expect(res.status).toBe(200)
    })

    it('GET /api/v1/catalogo_associati corretto',async() => {
        const res = await request(app).get('/api/v1/catalogo_associati').set("x-access-token",token).send()
        expect(res.status).toBe(403)
    })

})