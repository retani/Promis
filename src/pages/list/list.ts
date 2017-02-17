import { Component } from '@angular/core';
import { NavController, ActionSheetController, AlertController } from 'ionic-angular';
import { VideoPlayer, VideoEditor } from 'ionic-native';
import { StorageManager } from '../../services/storage-manager';
import { LocalVideo } from 'api/models';
import { MongoObservable } from 'meteor-rxjs';
declare var S3:any;
declare var window:any;

@Component({
  selector: 'page-list',
  templateUrl: 'list.html'
})
export class ListPage {

  videos;
  s3Uploads;

  constructor(
    public navCtrl: NavController, 
    public actionSheetCtrl: ActionSheetController,  
    public alertCtrl: AlertController,
    private storageManager: StorageManager) {
  }

  ngOnInit() {
    this.videos = this.storageManager.videos.find({}).zone();

    // observe uploads collection in S3 package and transfer upload progress
    this.s3Uploads = new MongoObservable.Collection(S3.collection);
    this.s3Uploads.find({})
    .subscribe(files => {
      files.forEach((file) => {
        let video = this.storageManager.findVideo({filename: file.file.original_name})
        video.uploadProgress = file.percent_uploaded;
        this.storageManager.updateVideo(video);
      });  
    });

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
         text: 'Upload',
         handler: () => {
           this.uploadVideo(id)
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

  uploadVideo(id:string) {
    let video = this.storageManager.getVideo(id)
    let self = this;
    window.resolveLocalFileSystemURL("file://" + video.transcodedPath, 
      function(fileEntry) {
        fileEntry.file(function(file) {
          video.filename = file.name;
          self.storageManager.updateVideo(video);
          var xhr = new XMLHttpRequest();
          xhr.open(
          /* method */ "GET",
          /* file */ video.transcodedPath,
          /* async */ true
          );
          xhr.responseType = "arraybuffer";
          xhr.onload = function(evt) {
            var blob = new Blob([xhr.response], {type: file.type});
            blob['name'] = file.name;
            console.log("attempting upload with");
            console.log(JSON.stringify(blob));
            S3.upload({
              files:[blob],
              path:"videos"
            }, function(e, r) {
                console.log("S3 callback")
                if(e) {
                  console.log(JSON.stringify(e));  
                } else {
                  console.log(JSON.stringify(r));
                  // update local video
                  video.uploaded = true;
                  self.storageManager.updateVideo(video);

                  // todo: create remote video object
                }                
            });
          }
          xhr.send(null);          
        });
      },
      function(e) {
        console.log(JSON.stringify(e));
      }
    );

  }

}
