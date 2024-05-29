import {Component, inject, Signal} from '@angular/core';
import {WeatherService} from "../weather.service";
import {ConditionsAndZip} from '../conditions-and-zip.type';
import { LocationService } from 'app/location.service';

@Component({
  selector: 'app-current-conditions',
  templateUrl: './current-conditions.component.html',
  styleUrls: ['./current-conditions.component.css']
})
export class CurrentConditionsComponent {

  private locationService = inject(LocationService);
  private weatherService = inject(WeatherService);
  protected currentConditionsByZip: Signal<ConditionsAndZip[]> = this.weatherService.getCurrentConditions();

  protected removeLocation(zip: string) {
    this.locationService.removeLocation(zip);
  }

}
