import { Eventi_info } from "./Eventi_info";

class Gestione_eventi_info{
    eventi_info:Eventi_info[] = [];

    constructor(eventi_info?:Eventi_info[]) {
        this.eventi_info = eventi_info;
    }

    aggiungi_evento(evento: Eventi_info): boolean{
        const len = this.eventi_info.length;
        const newlen = this.eventi_info.push(evento);
        return newlen == len+1;
    }

    rimuovi_evento(evento: Eventi_info): boolean{
        var done = false;
        this.eventi_info.forEach((item, i) => {
            if(item.data == evento.data && item.testo == evento.testo) {
                const removedItem = this.eventi_info.splice(i, 1);
                if(removedItem.length == 1) {
                    done = true;
                }
            }
        });
        return done;
    }
}