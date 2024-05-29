import { Injectable } from '@angular/core';

/**
 * Manage the cache data.
 * Use the browser local storage.
 */
@Injectable({
  providedIn: 'root'
})
export class CacheService {

  /**
   * Add a value in the cache.
   * @param opts.key The unique key of the cached value to use to recover the data
   * @param opts.value The value to cache
   */
  async set<T>({key, value}: {key: string, value: T}): Promise<void> {

    const cacheData: CacheData<T> = {
      value,
      creationDate: (new Date()).toISOString()
    };

    localStorage.setItem(this.getCacheKey(key), JSON.stringify(cacheData));
  }

  /**
   * Get a value from the cache.
   * @param opts.key The unique key to use to recover the data from.
   * @param opts.expireIn The expiration duration in seconds. If undefined, the cached value is always returned if exists.
   * @returns The cached value. Or null if the cache does not exist or expired.
   */
  async get<T>({key, expireIn}: {key: string, expireIn?: number}): Promise<T | null> {
    const data = localStorage.getItem(this.getCacheKey(key));

    try {
      const cacheData = JSON.parse(data) as CacheData<T>;

      // Check the expiration date
      if (expireIn !== undefined || expireIn !== null) {
        const now = new Date();
        const expirationDate = new Date(cacheData.creationDate);
        expirationDate.setSeconds(expirationDate.getSeconds() + expireIn);

        if (expirationDate < now) {
          return null;
        }
      }

      return cacheData.value;

    } catch (e) {
      // Invalid JSON data
      return null;
    }
  }

  /**
   * Returns the local storage key to use from a cache key
   */
  private getCacheKey(key: string): string {
    return `CACHE.${key}`;
  }
}

/**
 * The representation of a cached data
 */
export interface CacheData<T> {
  /** The cached value */
  value: T;
  /** The cache creation ISO date */
  creationDate: string;
}