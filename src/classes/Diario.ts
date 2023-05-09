import { Cliente } from "./Cliente";
import {Pagina} from "./Pagina";

export class Diario{
    pagine: Pagina[];
    cliente: Cliente;

    constructor(pagine: Pagina[], cliente: Cliente ) {
        this.pagine = pagine;
        this.cliente = cliente;
    }
}