import { Utente_registrato } from "./Utente_registrato";
import {Cliente} from "./Cliente";
import {Raccolta_recensioni} from "./Raccolta_recensioni";
import { Ruolo } from "./Ruolo";



export class Terapeuta extends Utente_registrato{
    associati: Cliente[];
    abilitato: boolean;
    documenti: string[];
    limite_clienti: number;
    indirizzo: string;
    recensioni: Raccolta_recensioni

    constructor(username: string, password: string, ruolo: Ruolo,nome: string, cognome: string, email: string, mail_confermata: boolean, codice_fiscale: string, foto_profilo: ImageData, data_nascita: Date, associati: Cliente[], abilitato: boolean, documenti: string[], limite_clienti: number, indirizzo: string, recensioni: Raccolta_recensioni){
        super(username, password, ruolo, nome, cognome, email, mail_confermata, codice_fiscale, foto_profilo, data_nascita);
        this.associati = associati;
        this.abilitato = abilitato;
        this.documenti = documenti;
        this.limite_clienti = limite_clienti;
        this.indirizzo = indirizzo;
        this.recensioni = recensioni;
    }

}