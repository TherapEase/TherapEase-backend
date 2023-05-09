import { Raccolta_recensioni } from "./Raccolta_recensioni";

class Graduatoria{
    collezioni: Raccolta_recensioni[];

    constructor(collezioni: Raccolta_recensioni[]) {
        this.collezioni = collezioni;
    }
}