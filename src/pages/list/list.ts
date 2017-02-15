import { Component } from '@angular/core';
import { NavController, ActionSheetController, AlertController } from 'ionic-angular';
import { VideoPlayer } from 'ionic-native';
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
    this.videos = this.storageManager.videos.zone();
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
           console.log('transcode clicked');
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



}
