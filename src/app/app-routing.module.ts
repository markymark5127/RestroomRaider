import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AgmCoreModule } from '@agm/core';
import { HomeComponent } from './home/home.component';
import { MapComponent } from './map/map.component';
import { PagenotfoundComponent } from './pagenotfound/pagenotfound.component';

const routes: Routes = [
  { path: '', redirectTo: '/home', pathMatch: 'full' },
  { path: 'home', component: HomeComponent },
  { path: 'map/:lat/:lon', component: MapComponent },
  { path: 'map', component: MapComponent },
  { path: '**', component: PagenotfoundComponent}
];
@NgModule({
  imports: [RouterModule.forRoot(routes, { enableTracing: true } )],
  exports: [RouterModule]
})
export class AppRoutingModule { }
