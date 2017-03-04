import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import { MediaCapture, MediaFile, CaptureError, CaptureVideoOptions } from 'ionic-native';
import { AlertController, Platform } from 'ionic-angular';
import { VideoManager } from '../../services/video-manager';
import { LocalVideo } from 'api/models';
declare var device: any;

@Component({
  selector: 'page-new',
  templateUrl: 'new.html'
})
export class NewPage {

  videoTitle;

  constructor(
    public navCtrl: NavController, 
    public alertCtrl: AlertController,
    private videoManager: VideoManager,
    public platform: Platform) {
  }

  ionViewWillEnter() {
    this.videoTitle = "";    
  }

  doCapture() {
    if(!this.videoTitle) {
      this.showMessage("Notice", "Please eneter a title!");
      return;
    }
	  let options: CaptureVideoOptions = { limit: 1 };
    if (this.platform.is('cordova')) {
      // running on device/emulator
  	  MediaCapture.captureVideo(options).then(
      	(data: MediaFile[]) => {
          let system = this.platform.is('ios') ? 'ios' : (this.platform.is('android') ? 'android' : 'windows');
          let video:LocalVideo = {
            localOrigin: true,
            originalPath: data[0].fullPath,
            deviceUuid: device.uuid,
            system: system + '@ ' + device.version,
            title: this.videoTitle
          }
          console.log(JSON.stringify(video));
  			  this.videoManager.addVideo(video);
          this.videoTitle = "";    
    
      	},
      	(err: CaptureError) => this.showMessage("Error", err.toString())
    	);
    } else {
      // running in dev mode
      console.log("not in cordova, do nothing")
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
