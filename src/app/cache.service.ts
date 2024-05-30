import { Injectable } from '@angular/core';

/**
 * Manage the cache data.
 * Use the browser local storage.
 */
@Injectable({
  providedIn: 'root'
})
export class CacheService {

  /** This attribute overrides the expireIn param from the get method */
  private debugExpireInValue: number | null = null;

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
      if (expireIn !== undefined || expireIn !== null || this.debugExpireInValue !== undefined || this.debugExpireInValue !== null) {
        const now = new Date();
        const expirationDate = new Date(cacheData.creationDate);
        expirationDate.setSeconds(expirationDate.getSeconds() + (this.debugExpireInValue ?? expireIn));

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
   * This method forces the expireIn parameter from the "get" method.
   * This is only for debugging purpose. Do not use out of this scope.
   * @param expireIn The value to force. It will override all the "expireIn" parameters passed to the "get" method. Set to null to reset the original value.
   */
  debugExpireIn(expireIn: number | null): void {
    this.debugExpireInValue = expireIn;
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