export class Connessione_gmail{
    token_path: string;
    credenziali_path: string;

    constructor(token_path: string, credenziali_path: string) {
        this.token_path = token_path;
        this.credenziali_path = credenziali_path;
    }
}