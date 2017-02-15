import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import { MediaCapture, MediaFile, CaptureError, CaptureVideoOptions } from 'ionic-native';
import { AlertController, Platform } from 'ionic-angular';
import { StorageManager } from '../../services/storage-manager';

@Component({
  selector: 'page-new',
  templateUrl: 'new.html'
})
export class NewPage {

  constructor(
    public navCtrl: NavController, 
    public alertCtrl: AlertController,
    private storageManager: StorageManager,
    public platform: Platform) {
  }

  doCapture() {
	  let options: CaptureVideoOptions = { limit: 1 };
    if (this.platform.is('cordova')) {
      // running on device/emulator
  	  MediaCapture.captureVideo(options).then(
      	(data: MediaFile[]) => {
  			  this.storageManager.addVideo(data[0].fullPath);
      	},
      	(err: CaptureError) => this.showMessage("Error", err.toString())
    	);
    } else {
      // running in dev mode
      console.log("inserting test data in dev mode")
      this.storageManager.addVideo("local_test");
    }

  }

  showMessage(title: string, message: string): void {
    const alert = this.alertCtrl.create({
      buttons: ['OK'],
      message: message,
      title: title
    });
    alert.present();
  }


}
