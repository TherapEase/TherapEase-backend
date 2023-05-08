import { Cliente } from "./Cliente";
import { Terapeuta } from "./Terapeuta";

export class Seduta{
    cliente: Cliente;
    terapeuta: Terapeuta;
    annullabile: boolean;
    data: Date;
}