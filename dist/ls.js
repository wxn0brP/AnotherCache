export class LocalStorageHardStore {
    key;
    constructor(key) {
        this.key = key;
    }
    read() {
        return JSON.parse(localStorage.getItem(this.key) ?? "{}");
    }
    save(data) {
        localStorage.setItem(this.key, JSON.stringify(data));
    }
}
