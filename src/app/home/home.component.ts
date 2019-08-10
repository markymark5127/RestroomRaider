import { Component, OnInit, ViewChild, ElementRef, NgZone, Input } from '@angular/core';
import { MapsAPILoader, MouseEvent, AgmMarker } from '@agm/core';
import { User } from '../objects/user';
import {Router} from '@angular/router';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {

  // saved values specific to users intially
  gotLocation: boolean;
  usersLat: number;
  usersLon: number;

  // I do not know what this does
  private geoCoder;

  // dynamic current values
  latitude: number;
  longitude: number;
  zoom: number;
  address: string;

  constructor(private mapsAPILoader: MapsAPILoader, private ngZone: NgZone, private router: Router) { }

  @ViewChild('search', {static: false})
  public searchElementRef: ElementRef;

  ngOnInit() {
    // load Places Autocomplete
    this.mapsAPILoader.load().then(() => {
      this.setCurrentLocation();
      this.geoCoder = new google.maps.Geocoder();
      const autocomplete = new google.maps.places.Autocomplete(this.searchElementRef.nativeElement, {
        types: ['address']
      });
      // tslint:disable-next-line: quotemark
      autocomplete.addListener("place_changed", () => {
        this.ngZone.run(() => {
          // get the place result
          const place: google.maps.places.PlaceResult = autocomplete.getPlace();
          // verify result
          if (place.geometry === undefined || place.geometry === null) {
            return;
          }
          // set latitude, longitude and zoom
          this.latitude = place.geometry.location.lat();
          this.longitude = place.geometry.location.lng();
          this.zoom = 12;
        });
      });
    });
  }
  // Get Current Location Coordinates
  private setCurrentLocation() {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(position => {
        this.gotLocation = true;
        this.latitude = position.coords.latitude;
        this.longitude = position.coords.longitude;
        this.usersLat = this.latitude;
        this.usersLon = this.longitude;
        this.zoom = 8;
        this.getAddress(this.latitude, this.longitude);
      });
    }
  }

  getAddress(latitude, longitude) {
    this.geoCoder.geocode({ location: { lat: latitude, lng: longitude } }, (results, status) => {
      console.log(results);
      console.log(status);
      if (status === 'OK') {
        if (results[0]) {
          this.zoom = 12;
          this.address = results[0].formatted_address;
        } else {
          window.alert('No results found');
        }
      } else {
        window.alert('Geocoder failed due to: ' + status);
      }

    });
  }

  goToMap() {
    this.router.navigate(['map', this.latitude, this.longitude, this.geoCoder, this.gotLocation, this.usersLat, this.usersLon]);
  }


}
