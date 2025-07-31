export class AnotherCache {
    _store = new Map();
    _ttl;
    _maxSize;
    _cleanupInterval;
    _cleanupLoopId;
    constructor(options) {
        this._ttl = options?.ttl ?? 5 * 60_000;
        this._maxSize = options?.maxSize;
        this._cleanupInterval = options?.cleanupInterval ?? 15 * 60_000;
        this._cleanupLoop();
    }
    set(key, value, ttl) {
        const expiresAt = Date.now() + (ttl ?? this._ttl);
        if (this._maxSize && this._store.size >= this._maxSize) {
            const oldestKey = this._store.keys().next().value;
            if (oldestKey !== undefined)
                this._store.delete(oldestKey);
        }
        this._store.set(key, { value, expiresAt });
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
    _cleanup() {
        const now = Date.now();
        for (const [key, entry] of this._store.entries()) {
            if (entry.expiresAt <= now)
                this._store.delete(key);
        }
    }
    _cleanupLoop() {
        if (this._cleanupLoopId)
            clearTimeout(this._cleanupLoopId);
        this._cleanupLoopId = setTimeout(() => this._cleanup(), this._cleanupInterval);
    }
}
