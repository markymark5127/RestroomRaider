import { Component, OnInit, ViewChild, ElementRef, NgZone } from '@angular/core';
import { MapsAPILoader, MouseEvent, AgmMarker } from '@agm/core';
import { ReadVarExpr } from '@angular/compiler';
import { BrowserModule } from '@angular/platform-browser';

class Location {
  id: number;
  name: string;
  lat: number;
  lon: number;
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
  lat: number,
  lon: number,
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
    this.lat = lat;
    this.lon = lon;
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

// just an interface for type safety.
interface Marker {
  lat: number;
  lng: number;
  label: string;
  draggable: boolean;
  clickable: boolean;
  icon?: string;
  info?: string;
  hasMens: boolean;
  hasWomens: boolean;
  hasFamily: boolean;
  hasUnisex: boolean;
  mensRate: number;
  womensRate: number;
  familyRate: number;
  unisexRate: number;
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent implements OnInit {

  // google maps markers
  markers: Marker[] = [
    {
      lat: 51.673858,
      lng: 7.815982,
      label: 'A',
      draggable: false,
      clickable: true,
      icon: '/../assets/TPRed.png',
      info: 'Hello World',
      hasMens: true,
      hasWomens: true,
      hasFamily: true,
      hasUnisex: true,
      mensRate: 5,
      womensRate: 5,
      familyRate: 5,
      unisexRate: 5,
    },
  ];


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



constructor( private mapsAPILoader: MapsAPILoader, private ngZone: NgZone) {
    this.loggedIn = false;
    this.mapShowing = false;
    this.detailsShowing = false;
    this.userFile = this.loadFile('/../assets/users.xml');
    this.locationFile = this.loadFile('/../assets/locations.xml');
    this.locationParser();
    // this.markers.length
    console.log('locationList length: ' + this.locationList.length);
    console.log('locationList id: ' + this.locationList[0].id);
    console.log('locationList lat: ' + this.locationList[0].lat);
    console.log('locationList lon: ' + this.locationList[0].lon);
    console.log('markers length: ' + this.markers.length);
  }



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
    console.log($event.latitude + ',' +  $event.latitude);
    this.getAddress(this.latitude, this.longitude);
    this.selectedLocation = new Location(
      1,
      'Mark\'s Place',
      39.5479569,
      -76.3470327,
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
    let locations: Location[] = new Array();
    let marks: Marker[] = new Array();
    parseString(this.locationFile , function(err, result) {
      let i: number;
      console.dir(result.locationList.location[0].id[0]);
      for (i = 0; i < 2; i++) {
        let loc: Location = new Location (
          parseInt(result.locationList.location[i].id, 10),
          result.locationList.location[i].name[0],
          parseFloat(result.locationList.location[i].lat),
          parseFloat(result.locationList.location[i].lon),
          (result.locationList.location[i].hasUnisex[0] === 'true'),
          parseInt(result.locationList.location[i].unisexRate, 10),
          (result.locationList.location[i].hasMens[0] === 'true'),
          parseInt(result.locationList.location[i].mensRate, 10),
          (result.locationList.location[i].hasWomens[0] === 'true'),
          parseInt(result.locationList.location[i].womensRate, 10),
          (result.locationList.location[i].hasFamily[0] === 'true'),
          parseInt(result.locationList.location[i].familyRate, 10),
          (result.locationList.location[i].hasBabyChanging[0] === 'true'),
          (result.locationList.location[i].hasBlowDryer[0] === 'true'),
          (result.locationList.location[i].hasPaperTowels[0] === 'true')
        );
        locations.push(loc);
        let value = 0;
        let outOf = 0;
        let iconURL = '';
        let inform = '';
        console.log(result.locationList.location[i].hasUnisex);
        console.log(loc.hasUnisex);
        if (loc.hasMens) {
          value = value + loc.mensRate;
          outOf = outOf + 1;
          inform = inform + 'Mens: ' + loc.mensRate.toString(10) + ' ';
        }
        if (loc.hasWomens) {
          value = value + loc.womensRate;
          outOf = outOf + 1;
          inform = inform + 'Womens: ' + loc.womensRate.toString(10) + ' ';
        }
        if (loc.hasFamily) {
          value = value + loc.familyRate;
          outOf = outOf + 1;
          inform = inform + 'Family: ' + loc.familyRate.toString(10) + ' ';
        }
        if (loc.hasUnisex) {
          value = value + loc.unisexRate;
          outOf = outOf + 1;
          inform = inform + 'Unisex: ' + loc.unisexRate.toString(10) + ' ';
        }
        if (inform === '') {
          inform = 'No Reviews Yet';
        }
        console.log('inform:');
        console.log(inform);
        switch ( Math.trunc( value / outOf ) ) {
          case 0:
          case 1:
            iconURL = '/../assets/TPRed.png';
            break;
          case 2:
          case 3:
            iconURL = '/../assets/TPYellow.png';
            break;
          case 4:
          case 5:
            iconURL = '/../assets/TPGreen.png';
            break;
          default:
            iconURL = '/../assets/TPYellow.png';
        }

        let mark: Marker = {
          lat: loc.lat,
          lng: loc.lon,
          label: loc.name,
          draggable: false,
          clickable: true,
          icon: iconURL,
          info: inform,
          hasMens: loc.hasMens,
          hasWomens: loc.hasWomens,
          hasFamily: loc.hasFamily,
          hasUnisex: loc.hasUnisex,
          mensRate: loc.mensRate,
          womensRate: loc.womensRate,
          familyRate: loc.familyRate,
          unisexRate: loc.unisexRate
        };
        marks.push(mark);
      }


    });
    this.locationList = locations;
    let i: number;
    console.log('marks length before for: ' + marks[0].lat);
    console.log('marks length before for: ' + marks[0].lng);
    // console.log("marks[i].lat is a number: ")
    this.markers = marks;
    /*for (i = 0, i < marks.length; i++;) {

      this.markers.push( marks[i] );
      /*{
        lat: marks[i].lat,
        lng: marks[i].lng,
        label: marks[i].label,
        draggable: false,
        icon: marks[i].icon,
        info: marks[i].info
      });
    }*/

  }

  userParser() {
    const parseString = require('xml2js').parseString;
    parseString(this.userFile, function(err, result) {
      console.log(name);

    });
  }
  showMapSearch() {
    const divToChange = document.getElementById('titleSearch');

    divToChange.style.minWidth = 'auto';
    divToChange.style.height = 'auto';
    divToChange.style.boxSizing = 'border-box';
    divToChange.style.textAlign = 'center';
    divToChange.style.fontFamily = 'Arial, Helvetica, sans-serif';
    divToChange.style.position = 'absolute';
    divToChange.style.top = '10%';
    divToChange.style.left = '2%';
    divToChange.style.backgroundImage = 'none';
    divToChange.style.backgroundColor = 'transparent';
    divToChange.style.margin = 'auto';

    const searchToChange = document.getElementById('searchBar');
    searchToChange.style.width = '90%';
    searchToChange.style.height = '50%';
    searchToChange.style.padding = '5%';
    searchToChange.style.paddingRight = '15%';
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
