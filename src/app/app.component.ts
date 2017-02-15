import { Component } from '@angular/core';
import { Platform } from 'ionic-angular';
import { StatusBar, Splashscreen } from 'ionic-native';
import { TabsPage } from '../pages/tabs/tabs';
declare var cordova:any;

@Component({
  templateUrl: 'app.html'
})
export class MyApp {
  rootPage = TabsPage;

  constructor(platform: Platform) {
    platform.ready().then(() => {
      // Okay, so the platform is ready and our plugins are available.
      // Here you can do any higher level native things you might need.
      if(platform.is('cordova')) {        

        console.log("hello cordova");

        StatusBar.styleDefault();
        Splashscreen.hide();
      
        let permissions = cordova.plugins.permissions;
        permissions.requestPermission(permissions.WRITE_EXTERNAL_STORAGE, 
          function(msg) { console.log("permission success: " + JSON.stringify(msg)) },
          function(msg) { console.log("permission error: " + JSON.stringify(msg)) }
        );
      }

    });
  }
}
