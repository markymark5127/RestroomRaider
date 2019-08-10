import { Component, OnInit } from '@angular/core';
import { ViewChild, ElementRef, NgZone, Input } from '@angular/core';
import { Location } from '../objects/location';
import { ActivatedRoute } from '@angular/router';
import { MapsAPILoader, MouseEvent, AgmMarker } from '@agm/core';


@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.css']
})
export class MapComponent implements OnInit {

  // Current map information
  latitude: number;
  longitude: number;
  zoom: number;
  address: string;
  locationFile: string;
  private geoCoder;
  gotLocation: boolean;
  usersLat: number;
  usersLon: number;

  showReview: boolean;

  public selectedLocation: Location = {};
  public locations: Location[] = [{}];

  constructor(private route: ActivatedRoute, private mapsAPILoader: MapsAPILoader, private ngZone: NgZone) {
    this.locationFile = this.loadFile('/../assets/locations.xml');
  }

  @ViewChild('search', {static: false})
  public searchElementRef: ElementRef;

  ngOnInit() {
    this.latitude = Number(this.route.snapshot.paramMap.get('lat'));
    this.longitude = Number(this.route.snapshot.paramMap.get('lon'));
    this.usersLat = Number(this.route.snapshot.paramMap.get('uLat'));
    this.usersLon = Number(this.route.snapshot.paramMap.get('uLon'));
    this.gotLocation = Boolean(this.route.snapshot.paramMap.get('gotLoc'));

    this.mapsAPILoader.load().then(() => {
      this.setCurrentLocation();
      this.geoCoder = new google.maps.Geocoder();
      this.geoCoder = this.route.snapshot.paramMap.get('geoCoder');
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

  markerClicked($event: AgmMarker, id: number) {
    console.log($event);
    this.latitude = $event.latitude;
    this.longitude = $event.longitude;
    this.getAddress(this.latitude, this.longitude);
    this.selectedLocation = this.locations[id];
   }

  loadFile(filePath) {
    let result = null;
    const xmlhttp = new XMLHttpRequest();
    xmlhttp.open('GET', filePath, false);
    xmlhttp.send();
    if (xmlhttp.status === 200) {
      result = xmlhttp.responseText;
    }
    return result;
  }

  locationParser() {
    const parseString = require('xml2js').parseString;
    const locs: Location[] = new Array();
    parseString(this.locationFile , (err, result) => {
      let i: number;
      for (i = 0; i < result.locationList.location.length; i++) {
        const loc: Location = {
          id: parseInt(result.locationList.location[i].id, 10),
          name: result.locationList.location[i].name[0],
          lat: parseFloat(result.locationList.location[i].lat),
          lon: parseFloat(result.locationList.location[i].lon),
          hasUnisex: (result.locationList.location[i].hasUnisex[0] === 'true'),
          unisexRate: parseInt(result.locationList.location[i].unisexRate, 10),
          hasMens: (result.locationList.location[i].hasMens[0] === 'true'),
          mensRate: parseInt(result.locationList.location[i].mensRate, 10),
          hasWomens: (result.locationList.location[i].hasWomens[0] === 'true'),
          womensRate: parseInt(result.locationList.location[i].womensRate, 10),
          hasFamily: (result.locationList.location[i].hasFamily[0] === 'true'),
          familyRate: parseInt(result.locationList.location[i].familyRate, 10),
          hasBabyChanging: (result.locationList.location[i].hasBabyChanging[0] === 'true'),
          hasBlowDryer: (result.locationList.location[i].hasBlowDryer[0] === 'true'),
          hasPaperTowels: (result.locationList.location[i].hasPaperTowels[0] === 'true')
        };
        let value = 0;
        let outOf = 0;
        if (loc.hasMens) {
          value = value + loc.mensRate;
          outOf = outOf + 1;
        }
        if (loc.hasWomens) {
          value = value + loc.womensRate;
          outOf = outOf + 1;
        }
        if (loc.hasFamily) {
          value = value + loc.familyRate;
          outOf = outOf + 1;
        }
        if (loc.hasUnisex) {
          value = value + loc.unisexRate;
          outOf = outOf + 1;
        }
        switch ( Math.trunc( value / outOf ) ) {
          case 0:
          case 1:
            loc.icon = '/../assets/TPRed.png';
            break;
          case 2:
          case 3:
            loc.icon = '/../assets/TPYellow.png';
            break;
          case 4:
          case 5:
            loc.icon = '/../assets/TPGreen.png';
            break;
          default:
            loc.icon = '/../assets/TPYellow.png';
        }
        locs.splice(loc.id, 0, loc);
      }
    });
    this.locations = locs;
  }

  showReviewPopup() {
    let returnVal = false;
    // if ( this.showReview && this.loggedIn) {
    if ( this.showReview) {
      returnVal = true;
    }
    //  } else if (this.showReview && !this.loggedIn) {
    //   this.loginClick = true;
    //   this.showReview = false;
    // }
    return returnVal;
  }


}
