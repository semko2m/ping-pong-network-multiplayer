import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import {AllCommonModule} from "./modules/all-common/all-common.module";
import {PongModule} from "./modules/pong/pong.module";

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    AllCommonModule,
    PongModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
