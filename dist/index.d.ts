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
export declare class AnotherCache<V = any, K = string> {
    options: AnotherCacheOptions;
    _store: Map<K, CacheEntry<V>>;
    _cleanupLoopId?: ReturnType<typeof setInterval>;
    _storeTime: number;
    constructor(options?: AnotherCacheOptions);
    set(key: K, value: V, ttl?: number): void;
    get(key: K): V | undefined;
    has(key: K): boolean;
    delete(key: K): boolean;
    clear(): void;
    size(): number;
    keys(): K[];
    _cleanup(): void;
    _cleanupLoop(): void;
    getOrFetch(key: K, fetcher: () => Promise<V>, ttl?: number): Promise<V>;
    getOrFetch(key: K, fetcher: () => V, ttl?: number): V;
    loadFromStore(): void;
    saveToStore(): void;
}
