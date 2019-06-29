import { Component, OnInit, ViewChild, ElementRef, NgZone } from '@angular/core';
import { MapsAPILoader, MouseEvent, AgmMarker } from '@agm/core';
import { ReadVarExpr } from '@angular/compiler';

class Location {
  id: number;
  name: string;
  hasUnisex: boolean;
  unisexRate: number;
  hasMens: boolean;
  mensRate: number;
  hasWomens: boolean;
  womensRate: number;
  hasFamily: boolean;
  familyRate: number;
  hasBabyChanging: boolean;
  hasBlowDryer: boolean;
  hasPaperTowels: boolean;
  constructor(
  id: number,
  name: string,
  hasUnisex: boolean,
  unisexRate: number,
  hasMens: boolean,
  mensRate: number,
  hasWomens: boolean,
  womensRate: number,
  hasFamily: boolean,
  familyRate: number,
  hasBabyChanging: boolean,
  hasBlowDryer: boolean,
  hasPaperTowels: boolean) {
    this.id = id;
    this.name = name;
    this.hasUnisex = hasUnisex;
    this.unisexRate = unisexRate;
    this.hasMens = hasMens;
    this.mensRate = mensRate;
    this.hasWomens = hasWomens;
    this.womensRate = womensRate;
    this.hasFamily = hasFamily;
    this.familyRate = familyRate;
    this.hasBabyChanging = hasBabyChanging;
    this.hasBlowDryer = hasBlowDryer;
    this.hasPaperTowels = hasPaperTowels;

  }
}
class User {
  id: number;
  firstName: string;
  lastName: string;
  userName: string;
  email: string;
  password: string;
  favorites: [];
  constructor(
  id: number,
  firstName: string,
  lastName: string,
  userName: string,
  email: string,
  password: string,
  favorites: []) {
    this.id = id;
    this.firstName = firstName;
    this.lastName = lastName;
    this.userName = userName;
    this.email = email;
    this.password = password;
    this.favorites = favorites;

  }
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent implements OnInit {


  constructor( private mapsAPILoader: MapsAPILoader, private ngZone: NgZone) {
    this.loggedIn = false;
    this.mapShowing = false;
    this.detailsShowing = false;
    this.userFile = this.loadFile('/../assets/users.xml');
    this.locationFile = this.loadFile('/../assets/locations.xml');
    this.locationParser();
  }

  // Array of "location" struct defined above
  // lists all locations
  locationList: Location[] = new Array();

  title = 'Restroom Raider';
  // Current map information
  latitude: number;
  longitude: number;
  zoom: number;
  address: string;
  private geoCoder;

  // Hides picture, shows/moves map, shrinks searchbar
  mapShowing: boolean;

  // Hides information untill marker is clicked
  detailsShowing: boolean;


  // Array of "user" struct defined above
  // exclusively for user logged in
  currentUser: User;

  // Array of "user" struct defined above
  // lists all users
  userList: [];

  // Array of "location" struct defined above
  // exclusively for the selected locatio display info
  selectedLocation: Location;

  // xml database files
  userFile: any;
  locationFile: any;

  // Current user information
  loggedIn: boolean;

  value: number;
  outOf: number;



  @ViewChild('search', {static: false})
  public searchElementRef: ElementRef;


  ngOnInit() {
    // load Places Autocomplete
    this.mapsAPILoader.load().then(() => {
      this.setCurrentLocation();
      this.geoCoder = new google.maps.Geocoder;

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
          this.mapShowing = true;
          this.showMapSearch();
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
    this.detailsShowing = true;
    this.latitude = $event.latitude;
    this.longitude = $event.longitude;
    this.getAddress(this.latitude, this.longitude);
    this.selectedLocation = new Location(
      1,
      'Mark\'s Place',
      true,
      5,
      true,
      5,
      true,
      5,
      true,
      5,
      true,
      true,
      true
    );
  }
  markerDragEnd($event: MouseEvent) {
    console.log($event);
    this.latitude = $event.coords.lat;
    this.longitude = $event.coords.lng;
    this.getAddress(this.latitude, this.longitude);
  }

  showMap($event: KeyboardEvent) {
    this.mapShowing = true;
    this.showMapSearch();
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
  loopCalcs(i: string | number) {
    let value = 0;
    let outOf = 0;
    if (this.locationList[i].hasMens) {
      value = value + this.locationList[i].mensRate;
      outOf = outOf + 5;
    }
    if (this.locationList[i].hasWomens) {
      value = value + this.locationList[i].womensRate;
      outOf = outOf + 5;
    }
    if (this.locationList[i].hasFamily) {
      value = value + this.locationList[i].familyRate;
      outOf = outOf + 5;
    }
    this.value = value;
    this.outOf = outOf;
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
    var locations: Location[] = new Array();
    parseString(this.locationFile , function(err, result) {
      var i: number;
      console.dir(result.locationList.location[0].id[0]);
      for (i = 0; i < 2; i++)
      {
        var loc: Location = new Location (
          parseInt(result.locationList.location[i].id[0],10),
          result.locationList.location[i].name,
          result.locationList.location[i].hasUnisex,
          parseInt(result.locationList.location[i].unisexRate,10),
          result.locationList.location[i].hasMens,
          parseInt(result.locationList.location[i].mensRate, 10),
          (result.locationList.location[i].hasWomens=== 'true'),
          parseInt(result.locationList.location[i].womensRate, 10),
          (result.locationList.location[i].hasFamily === 'true'),
          parseInt(result.locationList.location[i].familyRate, 10),
          (result.locationList.location[i].hasBabyChanging === 'true'),
          (result.locationList.location[i].hasBlowDryer === 'true'),
          (result.locationList.location[i].hasPaperTowels === 'true')
        );
        locations.push(loc);
      }


    });
    this.locationList = locations;
  }
  /*id: number,
  name: string,
  hasUnisex: boolean,
  unisexRate: number,
  hasMens: boolean,
  mensRate: number,
  hasWomens: boolean,
  womensRate: number,
  hasFamily: boolean,
  familyRate: number,
  hasBabyChanging: boolean,
  hasBlowDryer: boolean,
  hasPaperTowels: boolean)*/
userParser() {
    const parseString = require('xml2js').parseString;
    parseString(this.userFile, function(err, result) {
      console.log(name);

    });
  }
showMapSearch()
{
    const divToChange = document.getElementById('titleSearch');
    divToChange.style.minWidth = '450px';
    divToChange.style.minHeight = '250px';
    divToChange.style.boxSizing = 'border-box';
    divToChange.style.textAlign = 'center';
    divToChange.style.fontFamily = 'Arial, Helvetica, sans-serif';
    divToChange.style.position = 'absolute';
    divToChange.style.top = '10%';
    divToChange.style.left = '0%';
    divToChange.style.backgroundImage = 'none';
    divToChange.style.backgroundColor = 'transparent';
    divToChange.style.margin = 'auto';

    const searchToChange = document.getElementById('searchBar');
    searchToChange.style.fontSize = '80%';
    searchToChange.style.backgroundSize = '5% 40%';
    searchToChange.style.border = 'solid';
    searchToChange.style.borderColor = 'red';
    searchToChange.style.borderWidth = 'thin';

}
/*addUser(user) {
    const parseString = require('xml2js').parseString;
    const xml = '<root>Hello xml2js!</root>';
    let favorites;
    const obj = {username: user.name, email: user.email, password: user.password, first: user.first, last: user.last, favorites: user.favorites};
    parseString(this.userFile, function(err, result) {
      console.dir(result);
    });

}*/

}
