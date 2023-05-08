import {Utente} from "./Utente";


export abstract class Utente_registrato extends Utente{
    nome: string;
    cognome: string;
    email: string;
    mail_confermata: boolean;
    codice_fiscale: string;
    foto_profilo: ImageData; // TO CHECK -> correct type
    data_nascita: Date;
}