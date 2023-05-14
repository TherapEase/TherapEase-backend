import { Utente_registrato } from "./Utente_registrato";
import {Terapeuta} from "./Terapeuta";
import {Diario} from "./Diario";
import { Ruolo } from "./Ruolo";


export class Cliente extends Utente_registrato{
    n_gettoni: number = 0;
    associato: Terapeuta = null;
    diario: Diario = null;

    constructor(username: string, password: string, ruolo: Ruolo,nome: string, cognome: string, email: string, codice_fiscale: string, data_nascita: Date, mail_confermata?: boolean, foto_profilo?: ImageData,  n_gettoni?: number, associato?: Terapeuta, diario?: Diario) {
        super(username, password, ruolo,nome, cognome, email, codice_fiscale, data_nascita, mail_confermata, foto_profilo);
        this.n_gettoni = n_gettoni;
        this.associato = associato;
        this.diario = diario;
    }
}