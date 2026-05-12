import { HardStore } from ".";
export declare class LocalStorageHardStore implements HardStore {
    key: string;
    constructor(key: string);
    read(): any;
    save(data: Object): void;
}
