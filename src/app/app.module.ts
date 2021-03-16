import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';
import { IonicSelectableModule } from 'ionic-selectable';

import { IonicModule, IonicRouteStrategy } from '@ionic/angular';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HttpClientModule } from '@angular/common/http';

import { Camera } from '@ionic-native/camera/ngx';
import { File } from '@ionic-native/File/ngx';
import { WebView } from '@ionic-native/ionic-webview/ngx';
import { FilePath } from '@ionic-native/file-path/ngx';

import { IonicStorageModule } from '@ionic/storage';
import { SignaturePadModule } from 'angular2-signaturepad';
import { DatePicker } from '@ionic-native/date-picker/ngx';
import { Keyboard } from '@ionic-native/keyboard/ngx';
import { AppPreferences } from '@ionic-native/app-preferences/ngx';

@NgModule({
  declarations: [AppComponent],
  entryComponents: [],
  imports: [BrowserModule, IonicModule.forRoot(), AppRoutingModule, HttpClientModule, IonicStorageModule.forRoot(), SignaturePadModule, IonicSelectableModule  ],
  providers: [
    StatusBar,AppPreferences,
    SplashScreen,
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    Camera,
    File,
    WebView,
    FilePath,
    DatePicker,
    Keyboard
  ],
  bootstrap: [AppComponent]
})
export class AppModule {}
