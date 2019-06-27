import { Component, OnInit, ViewChild, ElementRef, NgZone } from '@angular/core';
import { MapsAPILoader, MouseEvent, AgmMarker } from '@agm/core';
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent implements OnInit {
  title = 'Restroom Raider';
  latitude: number;
  longitude: number;
  zoom: number;
  address: string;
  private geoCoder;

  // Hides picture, shows/moves map, shrinks searchbar
  mapShowing: boolean;

  // User information
  loggedIn = false;
  firstName = 'Johnny';
  lastName = 'Appleseed';
  userName = 'johnnyApple1234';
  userID = -1;

  // Displayed rating criteria
  locationID: number;
  hasUnisex: boolean;
  hasMensBR: boolean;
  hasWomensBR: boolean;
  unisexRating: number;
  mensRating: number;
  womensRating: number;
  hasBabyChanging: boolean;
  hasFamilyBR: boolean;
  familyRating: number;
  hasBlowDryer: boolean;
  hasPaperTowels: boolean;

  @ViewChild('search', {static: false})
  public searchElementRef: ElementRef;


  constructor(
    private mapsAPILoader: MapsAPILoader,
    private ngZone: NgZone
  ) {
    this.mapShowing = false;
  }


  ngOnInit() {
    // load Places Autocomplete
    this.mapsAPILoader.load().then(() => {
      this.setCurrentLocation();
      this.geoCoder = new google.maps.Geocoder;

      let autocomplete = new google.maps.places.Autocomplete(this.searchElementRef.nativeElement, {
        types: ["address"]
      });
      // tslint:disable-next-line: quotemark
      autocomplete.addListener("place_changed", () => {
        this.ngZone.run(() => {
          // get the place result
          let place: google.maps.places.PlaceResult = autocomplete.getPlace();

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
      navigator.geolocation.getCurrentPosition((position) => {
        this.latitude = position.coords.latitude;
        this.longitude = position.coords.longitude;
        this.zoom = 8;
        this.getAddress(this.latitude, this.longitude);
      });
    }
  }
  markerClicked($event: AgmMarker) {
    console.log($event);
    this.getAddress(this.latitude, this.longitude);
    this.hasUnisex = true;
    this.hasMensBR = true;
    this.hasWomensBR = true;
    this.hasFamilyBR = true;
    this.unisexRating = 5;
    this.mensRating = 5;
    this.womensRating = 5;
    this.familyRating = 5;
    this.hasBabyChanging = true;
    this.hasBlowDryer = true;
    this.hasPaperTowels = true;
  }

  markerDragEnd($event: MouseEvent) {
    console.log($event);
    this.latitude = $event.coords.lat;
    this.longitude = $event.coords.lng;
    this.getAddress(this.latitude, this.longitude);
  }

  showMap($event: KeyboardEvent){
    this.mapShowing = true;
  }

  getAddress(latitude, longitude) {
    this.geoCoder.geocode({ 'location': { lat: latitude, lng: longitude } }, (results, status) => {
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

}
