import { HardStore } from ".";

export class LocalStorageHardStore implements HardStore {
    constructor(public key: string) { }

    read() {
        return JSON.parse(localStorage.getItem(this.key) ?? "{}");
    }

    save(data: Object) {
        localStorage.setItem(this.key, JSON.stringify(data));
    }
}
