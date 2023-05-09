import { Utente } from "./Utente";

export class Messaggio{
    testo: string;
    data: Date;
    mittente: Utente;
    destinatario: Utente;
    letto: boolean;

    constructor(testo: string, data: Date, mittente: Utente, destinatario: Utente) {
        this.testo = testo;
        this.data = data;
        this.mittente = mittente;
        this.destinatario = destinatario;
        this.letto = false;
    }

}