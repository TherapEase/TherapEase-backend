export class Prodotto{
    id:number;
    nome:string;
    prezzo: Float32Array; // va bene come tipo?
    n_gettoni: number;

    constructor(id:number, nome:string, prezzo: Float32Array, n_gettoni: number) {
        this.id = id;
        this.nome = nome;
        this.prezzo = prezzo;
        this.n_gettoni = n_gettoni;
    }
}