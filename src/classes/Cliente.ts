import { Utente_registrato } from "./Utente_registrato";
import {Terapeuta} from "./Terapeuta";
import {Diario} from "./Diario";


export class Cliente extends Utente_registrato{
    n_gettoni: number;
    associato: Terapeuta;
    diario: Diario;
}