import { Request, Response } from 'express'
import { Pagina, IPagina } from '../schemas/pagina_schema'
import { Terapeuta } from '../schemas/terapeuta_schema'
import { Cliente } from '../schemas/cliente_schema'
import { Diario, IDiario } from '../schemas/diario_schema'



export async function scrivi_pagina(req: Request, res: Response) {
    //controllo accesso: solo il cliente può scrivere
    const id_cliente = req.body.loggedUser._id

    if (req.body.loggedUser.ruolo != 1) {
        res.status(403).json({
            successful: false,
            message: "Request denied!"
        })
    }

    //controllo campi: data: Date e testo: string
    const data = req.body.data
    const testo = req.body.testo

    if (!data || !testo) {
        res.status(400).json({
            successful: false,
            message: "Not enough arguments!"
        })
    }
    //controllo data: la pagina non può essere di un giorno futuro
    else if (new Date(data).getTime() > Date.now()) {

        res.status(400).json({
            successful: false,
            message: "Cannot create page in the future!"
        })
    }
    try {
        //controllo che non sia già presente una pagina quel giorno
        let pagina_presente = await Pagina.findOne({ data: data, cliente: id_cliente }).exec()
        if (!pagina_presente) {
            let pagina_schema = new Pagina<IPagina>({
                cliente: id_cliente,
                data: data,
                testo: testo,
            })

            await Pagina.create(pagina_schema)
            let diario_presente = await Diario.findOne({ cliente: id_cliente }).exec()

            /*controlla che il diario non sia già presente: 
            1. se non è presente, crea il diario, salva la pagina e inserisci l'id del diario in Utenti.diario
            2. se esiste già, esegue un push della pagina all'interno dell'array pagine
            */

            if (!diario_presente) {
                let diario_schema = new Diario<IDiario>({
                    cliente: id_cliente,
                    pagine: [(pagina_schema._id).toString()]
                })
                await Diario.create(diario_schema)
                await Cliente.findByIdAndUpdate(id_cliente, { diario: diario_schema._id }).exec()
            } else {
                await Diario.findOneAndUpdate({ cliente: id_cliente }, { $push: { pagine: pagina_schema._id.toString() } }).exec()
            }
            res.status(200).json({
                successful: true,
                message: "Page successfully created"
            })
        }
        res.status(403).json({
            successful: false,
            message: "Page already present"
        })
    } catch (err) {
        res.status(500).json({
            successful: false,
            message: "Server error in page creation - failed"
        }) 
    }
}


export async function leggi_my_diario(req: Request, res: Response) {

    //solo clienti possono leggere il diario
    if (req.body.loggedUser.ruolo != 1) {
        res.status(403).json({
            successful: false,
            message: "Request denied!"
        })
    }
    try {
        let diario = await Pagina.find({ cliente: req.body.loggedUser._id }, 'data testo').exec()

        res.status(200).json({
            message: "Pages successfully retrieved!",
            pagine: diario
        })
    }
    catch (err) {
        res.status(500).json({
            successful: false,
            message: "Server error in page reading - failed"
        })
    }
}

export async function leggi_diario_cliente(req: Request, res: Response) {
    const id_cliente_associato = req.params.id
    //solo clienti possono leggere il diario
    if (req.body.loggedUser.ruolo != 2) {
        res.status(403).json({
            successful: false,
            message: "Request denied!"
        })
    }
    try {
        const terapeuta = await Terapeuta.findOne({ _id: req.body.loggedUser._id }).exec()
        if (!terapeuta.associati.includes(id_cliente_associato)) {
            res.status(403).json({
                successful: false,
                message: "Request denied!"
            })
        }
        let diario = await Pagina.find({ cliente: id_cliente_associato }, 'data testo').exec()

        res.status(200).json({
            message: "Pages successfully retrieved!",
            pagine: diario
        })
    }
    catch (err) {
        res.status(500).json({
            successful: false,
            message: "Server error in page reading - failed"
        })
    }
}

export async function modifica_pagina(req: Request, res: Response) {

    //solo i clienti possono modificare il diario
    const data = req.body.data

    if (req.body.loggedUser.ruolo != 1) {
        res.status(403).json({
            successful: false,
            message: "Request denied!"
        })
    }

    if (!req.body.testo) {
        res.status(400).json({
            successful: false,
            message: "Not enough arguments!"
        })
    }

    try {
        const pagina = await Pagina.findOne({ data: data, cliente: req.body.loggedUser._id }).exec()

        if (!pagina) {
            res.status(400).json({
                successful: false,
                message: "Page does not exist!"
            })
        }

        let updated_data = {
            testo: req.body.testo ? req.body.testo : pagina.testo
        }
        const updated_pagina = await Pagina.findOneAndUpdate({ data: data, cliente: req.body.loggedUser._id }, { testo: updated_data.testo }, { new: true }).exec()
        res.status(200).json({
            successful: true,
            message: "Page updated successfully!"
        })
    } catch (err) {
        res.status(500).json({
            successful: false,
            message: "Server error in updating page - failed!"
        })
    }
}


export async function elimina_pagina(req: Request, res: Response) {

    //solo i clienti possono modificare il diario
    const data = req.body.data

    if (req.body.loggedUser.ruolo != 1) {
        res.status(403).json({
            successful: false,
            message: "Request denied!"
        })
    }

    try {
        const pagina = await Pagina.findOneAndDelete({ data: data, cliente: req.body.loggedUser._id }).exec()
        if (!pagina) {
            res.status(400).json({
                successful: false,
                message: "Page does not exist!"
            })
        }
        const pagina_diario = await Diario.findOneAndUpdate({ cliente: req.body.loggedUser._id }, { $pull: { pagine: pagina._id } }, { new: true }).exec()
        console.log(pagina_diario)
        res.status(200).json({
            successful: true,
            message: "Page deleted successfully!"
        })
    } catch (err) {
        res.status(500).json({
            successful: false,
            message: "Server error in deleting page - failed!"
        })
    }
}