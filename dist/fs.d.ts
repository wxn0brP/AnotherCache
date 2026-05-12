import { HardStore } from ".";
export declare class FSStore implements HardStore {
    path: string;
    constructor(path: string);
    save(data: Object): void;
    read(): any;
}
