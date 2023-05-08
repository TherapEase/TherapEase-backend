import { Utente_registrato } from "./Utente_registrato";
import {Cliente} from "./Cliente";
import {Raccolta_recensioni} from "./Raccolta_recensioni";



export class Terapeuta extends Utente_registrato{
    associati: Cliente[];
    abilitato: boolean;
    documenti: string[];
    limite_clienti: number;
    indirizzo: string;
    recensioni: Raccolta_recensioni
}