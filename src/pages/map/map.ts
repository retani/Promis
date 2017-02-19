import { Component, ViewChild, ElementRef } from '@angular/core';
import { NavController } from 'ionic-angular';
import 'leaflet';
import 'leaflet.offline';

declare namespace L {
    function map(s: string): any;
}
declare namespace L.tileLayer {
    function offline(s: string, options: any): any;
}
declare namespace L.control {
    function savetiles(baseLayer:any, options: any): any;
    function layers(options: any): any;
}
   
@Component({
  selector: 'page-map',
  templateUrl: 'map.html'
})
export class MapPage { 
  constructor(public navCtrl: NavController) {}
 
  ionViewDidLoad(){
    this.loadMap();
  }

  loadMap(){
    var map = L.map('map');
    var baseLayer =  L.tileLayer.offline('http://{s}.tile.osm.org/{z}/{x}/{y}.png',
    { 
      attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors',
      subdomains: ['a', 'b', 'c'],
      minZoom: 8
    }
    ).addTo(map);

    //add buttons to save tiles in area viewed
    L.control.savetiles(baseLayer, {
        'zoomlevels': [13, 16], //optional zoomlevels to save, default current zoomlevel
        'confirm': function(layer, succescallback) {
            if (window.confirm("Save " + layer._tilesforSave.length)) {
                succescallback();
            }
        },
        'saveText': '<i class="fa fa-download" aria-hidden="true"></i>',
        'rmText': '<i class="fa fa-trash" aria-hidden="true"></i>'
    }).addTo(map);

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


    map.setView({
        lat: 51.985,
        lng: 5
    }, 16);
    //layer switcher control
    /*L.control.layers({
        "osm (offline)": baseLayer
    }).addTo(map);    */

  }
}