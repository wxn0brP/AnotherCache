import fs from "fs";
import { HardStore } from ".";

export class FSStore implements HardStore {
    constructor(public path: string) { }

    save(data: Object) {
        try {
            fs.writeFileSync(this.path, JSON.stringify(data));
        } catch (e) {
            console.error(e);
        }
    }

    read() {
        try {
            const data = fs.readFileSync(this.path, "utf-8");
            return JSON.parse(data);
        } catch (e) {
            console.error(e);
            return {};
        }
    }
}
