import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import { MediaCapture, MediaFile, CaptureError, CaptureVideoOptions } from 'ionic-native';
import { AlertController } from 'ionic-angular';
import { StorageManager } from '../../services/storage-manager';

@Component({
  selector: 'page-new',
  templateUrl: 'new.html'
})
export class NewPage {

  constructor(
    public navCtrl: NavController, 
    public alertCtrl: AlertController,
    private storageManager: StorageManager) {
  }

  doCapture() {
	  let options: CaptureVideoOptions = { limit: 1 };
	  MediaCapture.captureVideo(options).then(
    	(data: MediaFile[]) => {
			  this.storageManager.addVideo(data[0].fullPath);
    	},
    	(err: CaptureError) => this.showMessage("Error", err.toString())
  	);
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
