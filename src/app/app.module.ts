import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HttpClient } from '@angular/common/http';

import { AgmCoreModule } from '@agm/core';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    AgmCoreModule.forRoot({
      apiKey: 'AIzaSyDFTib6euExrWx33dIihy4QnL0w0WZNigs',
      language: 'en',
      libraries: ['geometry', 'places']

    })
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
