export interface CacheEntry<V> {
    value: V;
    expiresAt: number;
}

export interface AnotherCacheOptions {
    ttl?: number;
    maxSize?: number;
    cleanupInterval?: number;
    store?: HardStore;
    storeTime?: number;
    storeAutoMode?: boolean;
}

export interface HardStore {
    save(data: Object): void;
    read(): Object;
}

export class AnotherCache<V = any, K = string> {
    _store = new Map<K, CacheEntry<V>>();
    _cleanupLoopId?: ReturnType<typeof setInterval>;
    _storeTime: number;

    constructor(public options: AnotherCacheOptions = {}) {
        this.options = {
            ttl: 5 * 60_000,
            cleanupInterval: 15 * 60_000,
            storeTime: 5 * 60_000,
            storeAutoMode: true,
            ...options
        }

        this._storeTime = Date.now();
        if (this.options.store && this.options.storeAutoMode) this.loadFromStore();
        this._cleanupLoop();
    }

    set(key: K, value: V, ttl?: number): void {
        const expiresAt = Date.now() + (ttl ?? this.options.ttl);

        if (this.options.maxSize && this._store.size >= this.options.maxSize) {
            const oldestKey = this._store.keys().next().value;
            if (oldestKey !== undefined) this._store.delete(oldestKey);
        }

        this._store.set(key, { value, expiresAt });

        if (this.options.storeAutoMode && this.options.store)
            if (Date.now() - this._storeTime >= this.options.storeTime)
                this.saveToStore();
    }

    get(key: K): V | undefined {
        const entry = this._store.get(key);
        if (!entry) return undefined;

        if (Date.now() >= entry.expiresAt) {
            this._store.delete(key);
            return undefined;
        }

        return entry.value;
    }

    has(key: K): boolean {
        return this.get(key) !== undefined;
    }

    delete(key: K): boolean {
        return this._store.delete(key);
    }

    clear(): void {
        this._store.clear();
    }

    size(): number {
        this._cleanup();
        return this._store.size;
    }

    keys(): K[] {
        this._cleanup();
        return [...this._store.keys()];
    }

    _cleanup(): void {
        const now = Date.now();
        for (const [key, entry] of this._store.entries())
            if (entry.expiresAt <= now)
                this._store.delete(key);
    }

    _cleanupLoop(): void {
        if (this._cleanupLoopId) clearInterval(this._cleanupLoopId);
        this._cleanupLoopId = setInterval(() => this._cleanup(), this.options.cleanupInterval);
        if (typeof this._cleanupLoopId === "object" && "unref" in this._cleanupLoopId) this._cleanupLoopId.unref();
    }

    getOrFetch(key: K, fetcher: () => Promise<V>, ttl?: number): Promise<V>;
    getOrFetch(key: K, fetcher: () => V, ttl?: number): V;
    getOrFetch(
        key: K,
        fetcher: () => V | Promise<V>,
        ttl?: number
    ): V | Promise<V> {
        const cached = this.get(key);
        if (cached !== undefined)
            return cached as any;

        const result = fetcher();

        if (result instanceof Promise) {
            return result.then(value => {
                this.set(key as K, value as V, ttl);
                return value;
            }) as any;
        } else {
            this.set(key as K, result as V, ttl);
            return result as any;
        }
    }

    loadFromStore() {
        const data = this.options.store?.read() ?? {};
        for (const [key, value] of Object.entries(data))
            this._store.set(key as K, value as CacheEntry<V>);
    }

    saveToStore() {
        this._cleanup();
        this._storeTime = Date.now();
        const data: any = {};
        for (const [key, value] of this._store) data[key] = value;
        this.options.store?.save(data);
    }
}
