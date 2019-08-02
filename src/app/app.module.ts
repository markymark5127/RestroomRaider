import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { FormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import { AgmCoreModule } from '@agm/core';
import { HomeComponent } from './home/home.component';
import { MapComponent } from './map/map.component';
import { PagenotfoundComponent } from './pagenotfound/pagenotfound.component';

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    MapComponent,
    PagenotfoundComponent
  ],
  imports: [
    AppRoutingModule,
    RouterModule,
    BrowserModule,
    AgmCoreModule.forRoot({
      apiKey: 'AIzaSyDFTib6euExrWx33dIihy4QnL0w0WZNigs',
      language: 'en',
      libraries: ['geometry', 'places']

    }),
    FormsModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
