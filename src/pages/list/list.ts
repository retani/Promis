import { Component } from '@angular/core';
import { NavController, ActionSheetController } from 'ionic-angular';
import { MeteorObservable } from 'meteor-rxjs';
import { VideoPlayer } from 'ionic-native';
import { AlertController } from 'ionic-angular';
import { StorageManager } from '../../services/storage-manager';

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
    this.videos = this.storageManager.getVideos();
  }

  playVideo(id:string) {
     let video = this.storageManager.getVideo(id)
     console.log(video);
     if(video.localPath) {
        VideoPlayer.play(video.localPath).then(() => {
           console.log('video completed');
        }).catch(err => {
           console.log(err);
        });
     }
  }

  presentActionSheet(id:string) {
   	console.log(id)
   	let actionSheet = this.actionSheetCtrl.create({
     buttons: [
       {
         text: 'Transcode',
         handler: () => {
           console.log('Transcode clicked');
         }
       },
       {
         text: 'Upload/Download',
         handler: () => {
           console.log('Upload clicked');
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
                    console.log('Remove clicked');
                    MeteorObservable.call('removeVideo', id).subscribe({
                      next: () => console.log("remove complete"),
                      error: (err: Error) => console.log(err.toString())
                    });
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
           console.log('Cancel clicked');
         }
       }
     ]
   });

   actionSheet.present();
 }



}
