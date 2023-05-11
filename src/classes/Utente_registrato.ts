import { Ruolo } from "./Ruolo";
import {Utente} from "./Utente";


export abstract class Utente_registrato extends Utente{
    nome: string;
    cognome: string;
    email: string;
    mail_confermata: boolean = false;
    codice_fiscale: string;
    foto_profilo: ImageData; // TO CHECK -> correct type
    data_nascita: Date;

    constructor(username: string, password: string, ruolo: Ruolo,nome: string, cognome: string, email: string, codice_fiscale: string, data_nascita: Date, mail_confermata?: boolean, foto_profilo?: ImageData) {
        super(username, password, ruolo);
        this.nome = nome;
        this.cognome = cognome;
        this.email = email;
        this.mail_confermata = mail_confermata;
        this.codice_fiscale = codice_fiscale;
        this.foto_profilo = foto_profilo;
        this.data_nascita = data_nascita;
    }
}