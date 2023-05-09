import { Email_tipo } from "./Email_tipo";
import { Utente_registrato } from "./Utente_registrato";

class Email{
    testo: string;
    destinatario: Utente_registrato;
    tipo: Email_tipo;

    constructor(testo: string, destinatario: Utente_registrato, tipo: Email_tipo){
        this.testo = testo;
        this.destinatario = destinatario;
        this.tipo = tipo;
    }
}