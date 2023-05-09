import {Ruolo} from "./Ruolo";


export class Utente{
    username: string;
    password: string; // to change with Hash;
    ruolo: Ruolo;

    constructor(username: string, password: string, ruolo: Ruolo) {
        this.username = username;
        this.password = password;
        this.ruolo = ruolo;
    }


}