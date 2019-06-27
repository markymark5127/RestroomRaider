import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

import { AgmCoreModule } from '@agm/core';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    AgmCoreModule.forRoot({
      apiKey: 'AIzaSyALRmbjqqp_iq5rNXXuOee-MimPP8m4gEY',
      language: 'en',
      libraries: ['geometry','places']

    })
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
