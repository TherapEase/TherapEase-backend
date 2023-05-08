import { Utente_registrato } from "./Utente_registrato";

export class Segnalazione{
    mittente: Utente_registrato;
    segnalato: Utente_registrato;
    oggetto: string;
    data: Date;
    gestita: boolean;
}