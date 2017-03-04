import { Component } from '@angular/core';
import { MapOptionsComponent } from './map-options';
import { Platform, NavController, PopoverController } from 'ionic-angular';
import { Geolocation } from 'ionic-native';
import { VideoManager } from '../../services/video-manager';


import 'leaflet';
import 'leaflet.offline';

const DEFAULT_ZOOM = 10;
const DEFAULT_LAT = 64.1842953;
const DEFAULT_LNG = -51.730436;
const EQUATOR = 40075004;

declare namespace L {
    function map(s: string): any;
}
declare namespace L.tileLayer {
    function offline(s: string, options: any): any;
}
declare namespace L.control {
    function savetiles(baseLayer:any, options: any): any;
}


@Component({
  selector: 'page-map',
  templateUrl: 'map.html'
})
export class MapPage { 
  map;
  saveTiles;

  constructor(
      public navCtrl: NavController, 
      private platform: Platform,
      private popoverCtrl: PopoverController,
      private videoManager: VideoManager) {

      let settings = this.videoManager.settings;
      if(!settings.currentLat || !settings.currentLng || !settings.currentZoom) {
        settings.currentLat = DEFAULT_LAT;
        settings.currentLng = DEFAULT_LNG;
        settings.currentZoom = DEFAULT_ZOOM;
        this.videoManager.updateSettings(settings);
      }

  }
 
  ionViewDidLoad(){
    this.loadMap();
  }

  loadMap(){
    if(!this.map) {
        this.map = L.map('map');
 
        var baseLayer =  L.tileLayer.offline('https://cartodb-basemaps-{s}.global.ssl.fastly.net/light_all/{z}/{x}/{y}.png',
        { 
          attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>, &copy; <a href="https://carto.com/attribution">CARTO</a>',
          subdomains: ['a', 'b', 'c'],
          minZoom: 7,
          maxZoom: 18
        }
        ).addTo(this.map);

        //add buttons to save tiles in area viewed
        this.saveTiles = L.control.savetiles(baseLayer, {
            'zoomlevels': [16, 17, 18], //optional zoomlevels to save, default current zoomlevel
            'confirm': function(layer, succescallback) {
                if (window.confirm("Save " + layer._tilesforSave.length)) {
                    succescallback();
                }
            },
            'saveText': '<i class="fa fa-download" aria-hidden="true"></i>',
            'rmText': '<i class="fa fa-trash" aria-hidden="true"></i>'
        }).addTo(this.map);

        let settings = this.videoManager.settings;
        this.map.setView({
            lat: settings.currentLat,
            lng: settings.currentLng,
        }, settings.currentZoom);


        //events while saving a tile layer
        var progress;
        baseLayer.on('savestart', function(e) {
            progress = 0;
            console.log('tiles to save: ' + e._tilesforSave.length);
        });
        baseLayer.on('savetileend', function(e) {
            progress++;
            console.log("tiles saved: " + progress);
        });
        baseLayer.on('loadend', function(e) {
            console.log("Saved all tiles");
            window.alert("All tiles saved.");
        });
        baseLayer.on('tilesremoved', function(e) {
            console.log("Removed all tiles");
        });

        // track & save movement of map for persistence
        let self = this;
        this.map.on('move', function(e) {
            //console.log("map moved to " + JSON.stringify(self.map.getCenter()));
            let settings = self.videoManager.settings;
            settings.currentLat = self.map.getCenter().lat;
            settings.currentLng = self.map.getCenter().lng;
            settings.currentZoom = self.map.getZoom();
            self.videoManager.updateSettings(settings);
        })
    }

  }

  saveMapData() {
    console.log("saving");
    this.saveTiles._saveTiles();
  }

  trashMapData() {
    console.log("trashing");
    this.saveTiles._rmTiles();
  }

  setLocation() {
    console.log("trying to get location");
    Geolocation.getCurrentPosition().then((resp) => {
        console.log(JSON.stringify(resp));
        let lat = resp.coords.latitude;
        let lng = resp.coords.longitude;
        //let zoom = this.calculateZoomByAccureacy(resp.coords.accuracy);
        let zoom = this.map.getZoom()
        this.map.setView({
            lat: lat,
            lng: lng
        }, zoom);
    
    }).catch((error) => {
        console.log('Error getting location - using default location', error);
    });

  }

  calculateZoomByAccureacy(accuracy: number): number {
    // Source: http://stackoverflow.com/a/25143326
    const deviceHeight = this.platform.height();
    const deviceWidth = this.platform.width();
    const screenSize = Math.min(deviceWidth, deviceHeight);
    const requiredMpp = accuracy / screenSize;

    return ((Math.log(EQUATOR / (256 * requiredMpp))) / Math.log(2)) + 1;
  }

  showOptions(): void {
    const popover = this.popoverCtrl.create(MapOptionsComponent, {}, {
      cssClass: 'options-popover chats-options-popover'
    });

    popover.onDidDismiss((params) => {
      if (params) {
        if (params.action == "save") {
          this.saveMapData();
        }
        else if (params.action == "trash") {
          this.trashMapData(); 
        }
        else if (params.action == "locate") {
          this.setLocation();
        }
      }
    });

    popover.present();
  }

}