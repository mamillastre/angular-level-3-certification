import { DecimalPipe } from '@angular/common';
import { Component, Input, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { ConditionsAndZip } from 'app/conditions-and-zip.type';
import { LocationService } from 'app/location.service';
import { WeatherService } from 'app/weather.service';

@Component({
  selector: 'app-current-conditions-card',
  standalone: true,
  imports: [DecimalPipe, RouterLink],
  templateUrl: './current-conditions-card.component.html',
  styleUrl: './current-conditions-card.component.css'
})
export class CurrentConditionsCardComponent {

  @Input({required: true}) location!: ConditionsAndZip;

  protected locationService = inject(LocationService);
  protected weatherService = inject(WeatherService);
  private router = inject(Router);

  showForecast(zipcode : string){
    this.router.navigate(['/forecast', zipcode])
  }
}
