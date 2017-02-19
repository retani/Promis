import { Component, Injectable } from '@angular/core';
import { Alert, AlertController, NavController, ViewController } from 'ionic-angular';
import { MapPage } from './map'

@Component({
  selector: 'map-options',
  templateUrl: 'map-options.html'
})
@Injectable()
export class MapOptionsComponent {
  constructor(
    private alertCtrl: AlertController,
    private navCtrl: NavController,
    private viewCtrl: ViewController
  ) {}
  
  handleError(e: Error): void {
    console.error(e);

    const alert = this.alertCtrl.create({
      title: 'Error',
      message: e.message,
      buttons: ['OK']
    });

    alert.present();
  }

  dismiss(action:string) {
    this.viewCtrl.dismiss({action: action});
  }
}
