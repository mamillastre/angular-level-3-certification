import {Injectable, Injector, Signal, inject, signal} from '@angular/core';
import {Observable} from 'rxjs';

import {HttpClient} from '@angular/common/http';
import {CurrentConditions} from './current-conditions/current-conditions.type';
import {ConditionsAndZip} from './conditions-and-zip.type';
import {Forecast} from './forecasts-list/forecast.type';
import { LocationService } from './location.service';
import { cache } from './cache.operator';

@Injectable()
export class WeatherService {

  static URL = 'https://api.openweathermap.org/data/2.5';
  static APPID = '5a4b2d457ecbef9eb2a71e480b947604';
  static ICON_URL = 'https://raw.githubusercontent.com/udacity/Sunshine-Version-2/sunshine_master/app/src/main/res/drawable-hdpi/';
  private currentConditions = signal<ConditionsAndZip[]>([]);

  private injector = inject(Injector);

  constructor(
    private http: HttpClient,
    private locationService: LocationService
  ) {
    // Watch the saved locations updates
    this.locationService.getLocations().subscribe((locations) => {
      // Remove the locations
      this.currentConditions().forEach((conds) => {
        if (!locations.includes(conds.zip)) {
          this.removeCurrentConditions(conds.zip);
        }
      });

      // Add the missing locations
      const computedZipcodes = this.currentConditions().map((d) => d.zip);
      locations.forEach((zip) => {
        if (!computedZipcodes.includes(zip)) {
          this.addCurrentConditions(zip);
        }
      });
    });
  }

  addCurrentConditions(zipcode: string): void {
    // Here we make a request to get the current conditions data from the API. Note the use of backticks and an expression to insert the zipcode
    this.http.get<CurrentConditions>(`${WeatherService.URL}/weather?zip=${zipcode},us&units=imperial&APPID=${WeatherService.APPID}`)
      .pipe(
        cache({
          key: `weather-${zipcode}`,
          expireIn: 7200, // Expire in 2 hours
          injector: this.injector
        })
      )
      .subscribe(
        data => this.currentConditions.update(conditions => [...conditions, {zip: zipcode, data}]),
        err => {
          // Remove the location if the zip code / city is invalid
          if(err?.status === 400 || err?.status === 404) {
            this.locationService.removeLocation(zipcode);
          }
        }
      );
  }

  removeCurrentConditions(zipcode: string) {
    this.currentConditions.update(conditions => {
      for (let i in conditions) {
        if (conditions[i].zip == zipcode)
          conditions.splice(+i, 1);
      }
      return conditions;
    })
  }

  getCurrentConditions(): Signal<ConditionsAndZip[]> {
    return this.currentConditions.asReadonly();
  }

  getForecast(zipcode: string): Observable<Forecast> {
    // Here we make a request to get the forecast data from the API. Note the use of backticks and an expression to insert the zipcode
    return this.http.get<Forecast>(`${WeatherService.URL}/forecast/daily?zip=${zipcode},us&units=imperial&cnt=5&APPID=${WeatherService.APPID}`)
      .pipe(
        cache({
          key: `daily-forecast-${zipcode}`,
          expireIn: 7200, // Expire in 2 hours
          injector: this.injector
        })
      );
  }

  getWeatherIcon(id): string {
    if (id >= 200 && id <= 232)
      return WeatherService.ICON_URL + "art_storm.png";
    else if (id >= 501 && id <= 511)
      return WeatherService.ICON_URL + "art_rain.png";
    else if (id === 500 || (id >= 520 && id <= 531))
      return WeatherService.ICON_URL + "art_light_rain.png";
    else if (id >= 600 && id <= 622)
      return WeatherService.ICON_URL + "art_snow.png";
    else if (id >= 801 && id <= 804)
      return WeatherService.ICON_URL + "art_clouds.png";
    else if (id === 741 || id === 761)
      return WeatherService.ICON_URL + "art_fog.png";
    else
      return WeatherService.ICON_URL + "art_clear.png";
  }

}
