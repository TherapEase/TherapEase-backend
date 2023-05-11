import { Utente_registrato } from "./Utente_registrato";
import { Cliente } from "./Cliente";
import { Raccolta_recensioni } from "./Raccolta_recensioni";
import { Ruolo } from "./Ruolo";



export class Terapeuta extends Utente_registrato {
    associati: Cliente[] = [];
    abilitato: boolean = false;
    documenti: string[];
    limite_clienti: number = 30;
    indirizzo: string;
    recensioni: Raccolta_recensioni;

    constructor(username: string, password: string, ruolo: Ruolo, nome: string, cognome: string, email: string, codice_fiscale: string, data_nascita: Date, documenti: string[], indirizzo: string, recensioni: Raccolta_recensioni, mail_confermata?: boolean, foto_profilo?: ImageData, associati?: Cliente[], abilitato?: boolean, limite_clienti?: number) {
        super(username, password, ruolo, nome, cognome, email, codice_fiscale, data_nascita, mail_confermata, foto_profilo);
        this.associati = associati;
        this.abilitato = abilitato;
        this.documenti = documenti;
        this.limite_clienti = limite_clienti;
        this.indirizzo = indirizzo;
        this.recensioni = recensioni;
    }

}