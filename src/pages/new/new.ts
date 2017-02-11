import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import { MediaCapture, MediaFile, CaptureError, CaptureVideoOptions } from 'ionic-native';
import { AlertController } from 'ionic-angular';
import { MeteorObservable } from 'meteor-rxjs';

@Component({
  selector: 'page-new',
  templateUrl: 'new.html'
})
export class NewPage {

  constructor(public navCtrl: NavController, public alertCtrl: AlertController) {
  }

  doCapture() {
	  let options: CaptureVideoOptions = { limit: 1 };
	  MediaCapture.captureVideo(options).then(
    	(data: MediaFile[]) => {
    		let fullPath = data[0].fullPath;
			  MeteorObservable.call('createVideo', fullPath).subscribe({
          next: () => this.showMessage("Sucess", "saved video to " + fullPath),
          error: (err: Error) => this.showMessage("Error", err.toString())
        });
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
