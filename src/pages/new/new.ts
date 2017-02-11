import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import { MediaCapture, MediaFile, CaptureError, CaptureVideoOptions } from 'ionic-native';
import { AlertController } from 'ionic-angular';

@Component({
  selector: 'page-new',
  templateUrl: 'new.html'
})
export class NewPage {

  constructor(public navCtrl: NavController, public alertCtrl: AlertController) {
  }

  doCapture() {
	let options: CaptureVideoOptions = { limit: 1 };
	MediaCapture.captureVideo(options)
  		.then(
    	(data: MediaFile[]) => {
    		var fileName = data[0].fullPath;
			let alert = this.alertCtrl.create({
      			title: 'Recording complete',
      			subTitle: fileName,
      			buttons: ['OK']
    		});
    		alert.present();
    	},
    	(err: CaptureError) => {
    		let alert = this.alertCtrl.create({
      			title: 'Recording error',
      			subTitle: err.toString(),
      			buttons: ['OK']
    		});
    		alert.present();
    	}
  	);
  }


}
