export interface CacheEntry<V> {
    value: V;
    expiresAt: number;
}

export interface AnotherCacheOptions {
    ttl?: number;
    maxSize?: number;
    cleanupInterval?: number;
}

export class AnotherCache<V = any, K = string> {
    _store = new Map<K, CacheEntry<V>>();
    _ttl: number;
    _maxSize?: number;
    _cleanupInterval?: number;
    _cleanupLoopId?: number;

    constructor(options?: AnotherCacheOptions) {
        this._ttl = options?.ttl ?? 5 * 60_000;
        this._maxSize = options?.maxSize;
        this._cleanupInterval = options?.cleanupInterval ?? 15 * 60_000;
        this._cleanupLoop();
    }

    set(key: K, value: V, ttl?: number): void {
        const expiresAt = Date.now() + (ttl ?? this._ttl);

        if (this._maxSize && this._store.size >= this._maxSize) {
            const oldestKey = this._store.keys().next().value;
            if (oldestKey !== undefined) this._store.delete(oldestKey);
        }

        this._store.set(key, { value, expiresAt });
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
        for (const [key, entry] of this._store.entries()) {
            if (entry.expiresAt <= now)
                this._store.delete(key);
        }
    }

    _cleanupLoop(): void {
        if (this._cleanupLoopId) clearTimeout(this._cleanupLoopId);
        this._cleanupLoopId = setTimeout(() => this._cleanup(), this._cleanupInterval);
    }

    getOrFetch<R>(
        key: K,
        fetcher: () => R extends Promise<infer U> ? Promise<U> : R,
        ttl?: number
    ): R extends Promise<any> ? Promise<V> : V {
        const cached = this.get(key);
        if (cached !== undefined) {
            return cached as any;
        }

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
}
