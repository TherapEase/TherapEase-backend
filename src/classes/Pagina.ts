
export class Pagina{
    data:Date;
    testo:string = ""

    constructor(data: Date, testo?: string) {
        this.data = data;
        this.testo = testo;
    }
}