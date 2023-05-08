import { Cliente } from "./Cliente";

export class Recensione{
    voto: number;
    testo: string;
    cliente: Cliente;
    data: Date;

    constructor(voto: number, testo: string, cliente: Cliente, data: Date) {
        this.voto = voto;
        this.testo = testo;
        this.cliente = cliente;
        this.data = data;
    }
}