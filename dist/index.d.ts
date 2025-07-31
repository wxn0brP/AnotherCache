export interface CacheEntry<V> {
    value: V;
    expiresAt: number;
}
export interface AnotherCacheOptions {
    ttl?: number;
    maxSize?: number;
    cleanupInterval?: number;
}
export declare class AnotherCache<V = any, K = string> {
    _store: Map<K, CacheEntry<V>>;
    _ttl: number;
    _maxSize?: number;
    _cleanupInterval?: number;
    _cleanupLoopId?: number;
    constructor(options?: AnotherCacheOptions);
    set(key: K, value: V, ttl?: number): void;
    get(key: K): V | undefined;
    has(key: K): boolean;
    delete(key: K): boolean;
    clear(): void;
    size(): number;
    _cleanup(): void;
    _cleanupLoop(): void;
}
