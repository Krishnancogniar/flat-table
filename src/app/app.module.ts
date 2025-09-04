import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { AngularSlickgridModule } from 'angular-slickgrid';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { FlatTableComponent } from './flat-table/flat-table.component';

@NgModule({
  declarations: [
    AppComponent,
    FlatTableComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpClientModule,
    AngularSlickgridModule.forRoot(),
    AppRoutingModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
