import { Prodotto } from "./Prodotto";

class Catalogo_prodotti{
    prodotti: Prodotto[] = [];

    constructor(prodotti?: Prodotto[]) {
        this.prodotti = prodotti;
    }

    aggiungi_prodotto(prodotto: Prodotto): boolean{
        const len = this.prodotti.length;
        const newlen = this.prodotti.push(prodotto);
        return newlen == len+1;
    }

    rimuovi_prodotto(id: number): boolean{
        var done = false;
        this.prodotti.forEach((item, i) => {
            if(item.id == id) {
                const removedItem = this.prodotti.splice(i, 1);
                if(removedItem.length == 1) {
                    done = true;
                }
            }
        });
        return done;
    }

}
