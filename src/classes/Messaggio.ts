import { Utente } from "./Utente";

export class Messaggio{
    testo: string;
    data: Date;
    mittente: Utente;
    destinatario: Utente;
    letto: boolean;
}