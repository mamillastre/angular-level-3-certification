import { BrowserModule } from '@angular/platform-browser';
import { ENVIRONMENT_INITIALIZER, NgModule, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { AppComponent } from './app.component';
import { ZipcodeEntryComponent } from './zipcode-entry/zipcode-entry.component';
import {LocationService} from "./location.service";
import { ForecastsListComponent } from './forecasts-list/forecasts-list.component';
import {WeatherService} from "./weather.service";
import { CurrentConditionsComponent } from './current-conditions/current-conditions.component';
import { MainPageComponent } from './main-page/main-page.component';
import { RouterModule} from "@angular/router";
import {routing} from "./app.routing";
import {HttpClientModule} from "@angular/common/http";
import { ServiceWorkerModule } from '@angular/service-worker';
import { environment } from '../environments/environment';
import { TabsComponent } from "./tabs/tabs.component";
import { TabDirective } from './tab.directive';
import { CurrentConditionsCardComponent } from './current-conditions-card/current-conditions-card.component';
import { CacheService } from './cache.service';

@NgModule({
  declarations: [
    AppComponent,
    ZipcodeEntryComponent,
    ForecastsListComponent,
    CurrentConditionsComponent,
    MainPageComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpClientModule,
    RouterModule,
    routing,
    ServiceWorkerModule.register('/ngsw-worker.js', { enabled: environment.production }),
    TabsComponent,
    TabDirective,
    CurrentConditionsCardComponent
  ],
  providers: [
    LocationService,
    WeatherService,
    {
      provide: ENVIRONMENT_INITIALIZER,
      multi: true,
      useValue() {
        // Initialize the debug expiration time of the cache from the query param value
        const queryParams = new URLSearchParams(window.location.search);
        const duration = parseInt(queryParams.get('debugCacheDuration'));
        if (!isNaN(duration)) {
          inject(CacheService).debugExpireIn(duration);
        }
      }
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
