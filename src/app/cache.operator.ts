import { Injector, assertInInjectionContext, inject } from '@angular/core';
import { MonoTypeOperatorFunction, Observable, of } from 'rxjs';
import { catchError, switchMap, tap } from 'rxjs/operators';
import { CacheService } from './cache.service';

/**
 * Observable operator to cache the emitted data.
 * The source observable will be subscribed only if there is no cache available or if the cache data expired (when providing the expireIn parameter).
 * 
 * @param opts.key The unique key to use to cache the emitted data. Must be unique to preserve the data consistency.
 * @param opts.expireIn The expiration duration in seconds.
 * @param opts.injector The injector context to use. If not specified, the current injection context will be used.
 */
export function cache<T>({ key, expireIn, injector }: {
  key: string,
  expireIn?: number,
  injector?: Injector
}): MonoTypeOperatorFunction<T> {

  // Get the injection context
  !injector && assertInInjectionContext(cache);
  injector = injector ?? inject(Injector);

  const cacheService = injector.get(CacheService);

  return function (source: Observable<T>): Observable<T> {

    return of(true).pipe( // Start with an observable that emit one value to manage a call to "cacheService.get()" on each observable subscription instead of only once on this method call
      switchMap(() => cacheService.get<T>({key, expireIn})),
      catchError(() => of(null as T | null)), // Consider the cache as null on any cache service errors
      switchMap(cache => {
        return cache ?
          // Returns the cache if available
          of(cache) :
          // Else return the source observable and save each emitted value in cache
          source.pipe(
            tap(value => cacheService.set({key, value}))
          );
      })
    );
    
  };
}


