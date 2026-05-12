import fs from "fs";
export class FSStore {
    path;
    constructor(path) {
        this.path = path;
    }
    save(data) {
        try {
            fs.writeFileSync(this.path, JSON.stringify(data));
        }
        catch (e) {
            console.error(e);
        }
    }
    read() {
        try {
            const data = fs.readFileSync(this.path, "utf-8");
            return JSON.parse(data);
        }
        catch (e) {
            console.error(e);
            return {};
        }
    }
}
