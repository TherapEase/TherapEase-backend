import { Cliente } from "./Cliente";
import { Terapeuta } from "./Terapeuta";

export class Seduta{
    cliente: Cliente;
    terapeuta: Terapeuta;
    annullabile: boolean;
    data: Date;

    constructor(terapeuta: Terapeuta, annullabile: boolean, data: Date) {
        this.cliente = null;
        this.terapeuta = terapeuta;
        this.annullabile = annullabile;
        this.data = data;
    }

    is_cliente_null(): boolean {
        return this.cliente == null;
    }
    
}