import { Terapeuta } from "./Terapeuta";
import { Recensione } from "./Recensione";

export class Raccolta_recensioni{
    terapeuta: Terapeuta;
    recensioni: Recensione[] = []

    constructor(terapeuta: Terapeuta, recensioni?: Recensione[]) {
        this.terapeuta = terapeuta;
        this.recensioni = recensioni;
    }

    aggiungi_recensione(recensione: Recensione): boolean{
        const len = this.recensioni.length;
        const newlen = this.recensioni.push(recensione);
        return newlen == len+1;
    }
}