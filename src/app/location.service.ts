import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export const LOCATIONS: string = "locations";

@Injectable()
export class LocationService {
  private locations$: BehaviorSubject<string[]>;

  constructor() {
    let locString = localStorage.getItem(LOCATIONS);

    this.locations$ = new BehaviorSubject<string[]>(
      locString ? JSON.parse(locString) : []
    );
  }

  getLocations() {
    return this.locations$.asObservable();
  }

  addLocation(zipcode: string) {
    const locations = [...this.locations$.getValue(), zipcode];
    localStorage.setItem(LOCATIONS, JSON.stringify(locations));
    this.locations$.next(locations);
  }

  removeLocation(zipcode: string) {
    const locations = this.locations$.getValue();
    let index = locations.indexOf(zipcode);
    if (index !== -1) {
      locations.splice(index, 1);
      localStorage.setItem(LOCATIONS, JSON.stringify(locations));
      this.locations$.next(locations);
    }
  }
}
