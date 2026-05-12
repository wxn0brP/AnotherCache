export class AnotherCache {
    options;
    _store = new Map();
    _cleanupLoopId;
    _storeTime;
    constructor(options = {}) {
        this.options = options;
        this.options = {
            ttl: 5 * 60_000,
            cleanupInterval: 15 * 60_000,
            storeTime: 5 * 60_000,
            storeAutoMode: true,
            ...options
        };
        this._storeTime = Date.now();
        if (this.options.store && this.options.storeAutoMode)
            this.loadFromStore();
        this._cleanupLoop();
    }
    set(key, value, ttl) {
        const expiresAt = Date.now() + (ttl ?? this.options.ttl);
        if (this.options.maxSize && this._store.size >= this.options.maxSize) {
            const oldestKey = this._store.keys().next().value;
            if (oldestKey !== undefined)
                this._store.delete(oldestKey);
        }
        this._store.set(key, { value, expiresAt });
        if (this.options.storeAutoMode && this.options.store)
            if (Date.now() - this._storeTime >= this.options.storeTime)
                this.saveToStore();
    }
    get(key) {
        const entry = this._store.get(key);
        if (!entry)
            return undefined;
        if (Date.now() >= entry.expiresAt) {
            this._store.delete(key);
            return undefined;
        }
        return entry.value;
    }
    has(key) {
        return this.get(key) !== undefined;
    }
    delete(key) {
        return this._store.delete(key);
    }
    clear() {
        this._store.clear();
    }
    size() {
        this._cleanup();
        return this._store.size;
    }
    keys() {
        this._cleanup();
        return [...this._store.keys()];
    }
    _cleanup() {
        const now = Date.now();
        for (const [key, entry] of this._store.entries())
            if (entry.expiresAt <= now)
                this._store.delete(key);
    }
    _cleanupLoop() {
        if (this._cleanupLoopId)
            clearInterval(this._cleanupLoopId);
        this._cleanupLoopId = setInterval(() => this._cleanup(), this.options.cleanupInterval);
        if (typeof this._cleanupLoopId === "object" && "unref" in this._cleanupLoopId)
            this._cleanupLoopId.unref();
    }
    getOrFetch(key, fetcher, ttl) {
        const cached = this.get(key);
        if (cached !== undefined)
            return cached;
        const result = fetcher();
        if (result instanceof Promise) {
            return result.then(value => {
                this.set(key, value, ttl);
                return value;
            });
        }
        else {
            this.set(key, result, ttl);
            return result;
        }
    }
    loadFromStore() {
        const data = this.options.store?.read() ?? {};
        for (const [key, value] of Object.entries(data))
            this._store.set(key, value);
    }
    saveToStore() {
        this._cleanup();
        this._storeTime = Date.now();
        const data = {};
        for (const [key, value] of this._store)
            data[key] = value;
        this.options.store?.save(data);
    }
}
