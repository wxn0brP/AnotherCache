# Another Cache

A simple, lightweight, and easy-to-use cache library for TypeScript and JavaScript projects.

## Installation

```bash
npm install @wxn0brp/ac
```

## Usage

```typescript
import { AnotherCache } from '@wxn0brp/ac';

// Create a new cache with default options
const cache = new AnotherCache<string, string>();

// Set a value with a default TTL
cache.set('key', 'value');

// Set a value with a custom TTL (in milliseconds)
cache.set('key2', 'value2', 10000); // 10 seconds

// Get a value
const value = cache.get('key');

// Check if a key exists
const hasKey = cache.has('key');

// Delete a key
cache.delete('key');

// Get the cache size
const size = cache.size();

// Clear the cache
cache.clear();
```

## Configuration

You can configure the cache with the following options:

- `ttl`: The default time-to-live for cache entries in milliseconds. Defaults to 5 minutes.
- `maxSize`: The maximum number of entries in the cache. When the cache reaches this size, the oldest entries will be removed. Defaults to no limit.
- `cleanupInterval`: The interval in milliseconds at which the cache will be cleaned up. Defaults to 15 minutes.

```typescript
import { AnotherCache } from '@wxn0brp/ac';

const cache = new AnotherCache({
  ttl: 10 * 60 * 1000, // 10 minutes
  maxSize: 100,
  cleanupInterval: 5 * 60 * 1000, // 5 minutes
});
```

## API

[API Reference](https://wxn0brp.github.io/AnotherCache/)

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

## Contributing

Contributions are welcome! Please open an issue or submit a pull request.
