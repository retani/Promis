import { Component } from '@angular/core';
import { NavController, ActionSheetController, AlertController } from 'ionic-angular';
import { VideoPlayer } from 'ionic-native';
import { VideoManager } from '../../services/video-manager';
import { LocalVideo } from 'api/models';

@Component({
  selector: 'page-list',
  templateUrl: 'list.html'
})
export class ListPage {

  videos;
  
  constructor(
    public navCtrl: NavController, 
    public actionSheetCtrl: ActionSheetController,  
    public alertCtrl: AlertController,
    private videoManager: VideoManager) {
  }

  ngOnInit() {
    this.videos = this.videoManager.videos.find({}).zone();
  }

  playVideo(id:string) {
     let video:LocalVideo = this.videoManager.getVideo(id)
     if(video.transcoded && video.transcodedPath) {
        VideoPlayer.play(video.transcodedPath).then(() => {
           console.log('transcoded video completed');
        }).catch(err => {
           console.log(err);
        });
     } else {
       if(video.originalPath) {
          VideoPlayer.play(video.originalPath).then(() => {
             console.log('video completed');
          }).catch(err => {
             console.log(err);
          });
       }
     }
  }

  presentActionSheet(id:string) {
   	console.log(id)
   	let actionSheet = this.actionSheetCtrl.create({
     buttons: [
       {
         text: 'Transcode',
         handler: () => {
           this.videoManager.transcodeVideo(id)
         }
       },
       {
         text: 'Upload',
         handler: () => {
           this.videoManager.uploadVideo(id)
         }
       },
       {
         text: 'Remove',
         handler: () => {

            let confirm = this.alertCtrl.create({
              title: 'Confirm',
              message: 'Remove this video?',
              buttons: [
                {
                  text: 'Ok',
                  handler: () => {
                    console.log('remove clicked');
                    this.videoManager.removeVideo(id)
                  }
                },
                {
                  text: 'Cancel',
                  handler: () => {
                    console.log('cancel')
                  }
                }
              ]
              });
              confirm.present();
           
         }
       },
       {
         text: 'Cancel',
         role: 'cancel',
         handler: () => {
           console.log('cancel clicked');
         }
       }
     ]
   });

   actionSheet.present();
  }

}
