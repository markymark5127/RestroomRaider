import { Component, OnInit, ViewChild, ElementRef, NgZone, Input } from '@angular/core';
import { MapsAPILoader, MouseEvent, AgmMarker } from '@agm/core';
import { of } from 'rxjs';

interface Location {
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
  icon?: string;
}

interface User {
  id: number;
  firstName: string;
  lastName: string;
  userName: string;
  email: string;
  password: string;
  favorites: any;
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})

export class AppComponent implements OnInit {
  @Input()
  title = 'Restroom Raider';
  public loginUserName: string;
  public loginPassword: string;

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
  users: User[] = [
    {
      id: -1,
      firstName: 'John',
      lastName: 'Appleseed',
      userName: 'johnnyAppleseed',
      password: 'apples1234',
      email: 'appleseed.johnny@apple.com',
      favorites: '1,2,3,4'
    }
  ];
  locations: Location[] = [
    {
      id: -1,
      name: 'dummy',
      lat: 0,
      lon: 0,
      hasUnisex: false,
      unisexRate: 0,
      hasMens: false,
      mensRate: 0,
      hasWomens: false,
      womensRate: 0,
      hasFamily: false,
      familyRate: 0,
      hasBabyChanging: false,
      hasBlowDryer: false,
      hasPaperTowels: false,
      icon: '../assets/TPYellow.png'
    }
  ];

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

  gotLocation: boolean;
  theirLat: number;
  theirLon: number;

  loginClick: boolean;
  signupClick: boolean;
  showReview: boolean;
  exsists: boolean;


constructor( private mapsAPILoader: MapsAPILoader, private ngZone: NgZone) {
    this.selectedLocation = this.locations[0];
    this.loginClick = false;
    this.signupClick = false;
    this.showReview = false;
    this.exsists = true;
    this.theirLat = 200;
    this.theirLon = 200;
    this.gotLocation = false;
    this.loggedIn = false;
    this.mapShowing = false;
    this.detailsShowing = false;
    this.userFile = this.loadFile('/../assets/users.xml');
    this.locationFile = this.loadFile('/../assets/locations.xml');
    this.locationParser();
    this.userParser();
  }



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
      navigator.geolocation.getCurrentPosition(position => {
        this.gotLocation = true;
        this.latitude = position.coords.latitude;
        this.longitude = position.coords.longitude;
        this.theirLat = this.latitude;
        this.theirLon = this.longitude;
        this.zoom = 8;
        this.getAddress(this.latitude, this.longitude);
      });

    }
  }
  markerClicked($event: AgmMarker, id: number) {
    console.log($event);
    this.detailsShowing = true;
    this.latitude = $event.latitude;
    this.longitude = $event.longitude;
    this.getAddress(this.latitude, this.longitude);
    this.selectedLocation = this.locations[id];
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

  userParser() {
    const parseString = require('xml2js').parseString;
    const us: User[] = new Array();
    parseString(this.userFile , (err, result) => {
      let i: number;
      for (i = 0; i < result.userList.user.length; i++) {
        const u: User = {
          id: parseInt(result.userList.user[i].id, 10),
          firstName: result.userList.user[i].first[0],
          lastName: result.userList.user[i].last[0],
          userName: result.userList.user[i].username[0],
          email: result.userList.user[i].email[0],
          favorites: result.userList.user[i].favorites[0],
          password: result.userList.user[i].password[0]
        };
        us.splice(u.id, 0, u);
      }
    });
    this.users = us;
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

  currLocCheck(search) {
    const findArray =
    ['current location', 'Current Location', 'Current location', 'current Location', 'currentlocation',
     'Near Me', 'Near me', 'nearme', 'near me', 'near Me'];
    if (findArray.indexOf(search) > -1 && this.gotLocation) {
      this.latitude = this.theirLat;
      this.longitude = this.theirLon;
      this.setCurrentLocation();
      if (!this.mapShowing) {
        this.mapShowing = true;
        this.showMapSearch();
      }
    }
  }

  loginClicked() {
    this.loginClick = ! this.loginClick;
  }

  signupClicked() {
    this.signupClick = ! this.signupClick;
  }

  showReviewPopup() {
    let returnVal = false;
    if ( this.showReview && this.loggedIn) {
      returnVal = true;
     } else if (this.showReview && !this.loggedIn) {
      this.loginClick = true;
      this.showReview = false;
    }
    return returnVal;
  }

  loginCheck() {
    for ( const currUser of this.users) {
      if ( (currUser.email ===  this.loginUserName ||
       currUser.userName === this.loginUserName) &&
       currUser.password === this.loginPassword) {
        this.loggedIn = true;
        this.currentUser = currUser;
        this.loginClick = false;
      }
    }
  }

}
