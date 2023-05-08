import { Terapeuta } from "./Terapeuta";

class Catalogo_terapeuti{
    terapeuti: Terapeuta[];

    constructor(terapeuti: Terapeuta[]) {
        this.terapeuti = terapeuti;
    }


    aggiungi_terapeuta(terapeuta: Terapeuta): boolean{
        const len = this.terapeuti.length;
        const newlen = this.terapeuti.push(terapeuta);
        return newlen == len+1;
    }

    //il problema in rimuovi evento è che dovremmo fare il controllo su un botto di merda del terapeuta
    //ci è venuto in mente di mettere un attributo id. Che ne dite?
    /*rimuovi_evento(terapeuta: Terapeuta): boolean{
        var done = false;
        this.terapeuti.forEach((item, i) => {
            if(item.data == evento.data && item.testo == evento.testo) {
                const removedItem = this.eventi_info.splice(i, 1);
                if(removedItem.length == 1) {
                    done = true;
                }
            }
        });
        return done;
    }*/


}