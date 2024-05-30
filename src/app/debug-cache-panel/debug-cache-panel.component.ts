import { AsyncPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { CacheService } from 'app/cache.service';
import { map } from 'rxjs/operators';

/**
 * A configuration panel to debug the cache service
 */
@Component({
  selector: 'app-debug-cache-panel',
  standalone: true,
  imports: [FormsModule, AsyncPipe],
  templateUrl: './debug-cache-panel.component.html',
  styleUrl: './debug-cache-panel.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DebugCachePanelComponent {

  private router = inject(Router);
  private route = inject(ActivatedRoute);
  protected cacheService = inject(CacheService);

  /** The configured cache duration in query params */
  protected currentDebugDuration$ = this.route.queryParamMap.pipe(
    map(params => {
      const duration = parseInt(params.get('debugCacheDuration'));
      return !isNaN(duration) ? duration : null;
    })
  );

  /**
   * Add the cache duration query param & update the value in the cache service
   * @param duration The duration in seconds. null to disable the debug value
   */
  updateCacheDuration(duration: number | null) {
    this.cacheService.debugExpireIn(duration);
    this.router.navigate([], {queryParams: {debugCacheDuration: duration}});
  }
}
