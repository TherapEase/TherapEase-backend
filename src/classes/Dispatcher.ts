import { Messaggio } from "./Messaggio";

 
export class Dispatcher{
    coda_di_messaggi: Messaggio[];    

    constructor(coda_di_messaggi: Messaggio[]) {
        this.coda_di_messaggi = coda_di_messaggi;
    }

    aggiungi_messaggio(messaggio: Messaggio): boolean{
        const len = this.coda_di_messaggi.length;
        const newlen = this.coda_di_messaggi.push(messaggio);
        return newlen == len+1;
    }
}