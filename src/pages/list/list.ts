import { Component } from '@angular/core';
import { NavController, ActionSheetController, AlertController } from 'ionic-angular';
import { VideoPlayer } from 'ionic-native';
import { VideoManager } from '../../services/video-manager';
import { LocalVideo } from 'api/models';
declare var device: any;

@Component({
  selector: 'page-list',
  templateUrl: 'list.html'
})
export class ListPage {

  videos;
  remoteVideos;
  
  constructor(
    public navCtrl: NavController, 
    public actionSheetCtrl: ActionSheetController,  
    public alertCtrl: AlertController,
    private videoManager: VideoManager) {
  }

  ngOnInit() {
    this.videos = this.videoManager.videos.find({$or: [{originalPath: {$exists: true}}, {downloaded: true}, {downloading: true}]})
      .debounceTime(500)
      .zone();
    this.remoteVideos = this.videoManager.remoteVideos.find({})
      .debounceTime(500)
      .zone();
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
   	//console.log(id)
    let lv = this.videoManager.getVideo(id);

   	let actionSheetOptions = {
     buttons: [
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
    };

     if(!lv.transcoded) {
       actionSheetOptions.buttons.push(
         {
         text: 'Transcode',
         handler: () => {
           this.videoManager.transcodeVideo(id)
         }
       });
     }

     if(!lv.uploaded) {
       actionSheetOptions.buttons.push({
         text: 'Upload',
         handler: () => {
           this.videoManager.uploadVideo(id)
         }
       });
     }
       
    let actionSheet = this.actionSheetCtrl.create(actionSheetOptions);
    actionSheet.present();
  }

  downloaded(id) {
    let lv = this.videoManager.videos.findOne({remoteId: id});
    if(lv) {
      return lv.downloaded;
    }
    return false;
  }

  downloadProgress(id) {
    let lv = this.videoManager.videos.findOne({remoteId: id});
    if(lv) {
      return "downloaded: " + lv.downloadProgress;
    }
    return null;
  }

  checkLocalAuthor(id) {
    let lv = this.videoManager.videos.findOne({remoteId: id});
    if(lv && device) {
      return lv.deviceUuid == device.uuid;
    }
    return false;
  }

  removeRemote(id) {
    let confirm = this.alertCtrl.create({
        title: 'Confirm',
        message: 'Remove this remote video?',
        buttons: [
          {
            text: 'Ok',
            handler: () => {
              this.videoManager.removeRemoteVideo(id)
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
}
