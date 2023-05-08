import { Utente_registrato } from "./Utente_registrato";
import {Terapeuta} from "./Terapeuta";
import {Diario} from "./Diario";
import { Ruolo } from "./Ruolo";


export class Cliente extends Utente_registrato{
    n_gettoni: number;
    associato: Terapeuta;
    diario: Diario;

    constructor(username: string, password: string, ruolo: Ruolo,nome: string, cognome: string, email: string, mail_confermata: boolean, codice_fiscale: string, foto_profilo: ImageData, data_nascita: Date, n_gettoni: number, associato: Terapeuta, diario: Diario) {
        super(username, password, ruolo,nome, cognome, email, mail_confermata, codice_fiscale, foto_profilo, data_nascita);
        this.n_gettoni = n_gettoni;
        this.associato = associato;
        this.diario = diario;
    }
}