import { Component } from '@angular/core';
import { NavController, ActionSheetController, AlertController } from 'ionic-angular';
import { VideoPlayer, VideoEditor } from 'ionic-native';
import { StorageManager } from '../../services/storage-manager';
import { LocalVideo } from 'api/models'

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
    private storageManager: StorageManager) {
  }

  ngOnInit() {
    this.videos = this.storageManager.videos.zone();
  }

  playVideo(id:string) {
     let video:LocalVideo = this.storageManager.getVideo(id)
     console.log(video.originalPath);
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
           this.transcodeVideo(id)
         }
       },
       {
         text: 'Upload/Download',
         handler: () => {
           console.log('upload clicked');
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
                    this.storageManager.removeVideo(id)
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

 transcodeVideo(id:string) {
    let video = this.storageManager.getVideo(id)
    let self = this;
    let options = {
      fileUri: video.originalPath,
      outputFileName: "transcode_" + video._id,
      outputFileType: VideoEditor.OutputFileType.MPEG4,
      optimizeForNetworkUse: VideoEditor.OptimizeForNetworkUse.YES,
      saveToLibrary: true,
      maintainAspectRatio: true,
      width: 480,
      height: 360,
      videoBitrate: 1333333, // 1 megabit
      audioChannels: 2,
      audioSampleRate: 44100,
      audioBitrate: 128000, // 128 kilobits
      progress: function(info) {
        console.log("progress: " + info);
        video.transcoded = false;
        video.transcodeProgress = info;
        self.storageManager.updateVideo(video);
      }
    }
    console.log("transcodeVideo options " + JSON.stringify(options))
    VideoEditor.transcodeVideo(options)
      .then((fileUri: string) => {
        console.log('video transcode success, saving to: ' + fileUri);
        video.transcoded = true;
        video.transcodedPath = fileUri;
        this.storageManager.updateVideo(video);
      })
      .catch((error: any) => console.log('video transcode error ' + JSON.stringify(error)));
  }

}
