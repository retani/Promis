import { Component } from '@angular/core';
import { NavController, ActionSheetController } from 'ionic-angular';
import { VideosCollection } from 'api/collections';
import { Ground } from 'meteor/ground:db'
import { MeteorObservable } from 'meteor-rxjs';
import { VideoPlayer } from 'ionic-native';

@Component({
  selector: 'page-list',
  templateUrl: 'list.html'
})
export class ListPage {

  videos;
  offlineVideos;
  
  constructor(public navCtrl: NavController, public actionSheetCtrl: ActionSheetController) {
  }

  ngOnInit() {
    this.offlineVideos = new Ground.Collection('offlineVideos');    

    MeteorObservable.autorun().subscribe(() => {

      if(Meteor.status().status.toString() == "connected") {
        console.log("online mode")
        this.videos = VideosCollection.find({}).fetch(); // fetch videos from server for view
        this.offlineVideos.observeSource(VideosCollection.find({})); // copy server db to local cache
      }

      if(Meteor.status().status.toString() == "waiting") {
        console.log("offline mode")
        this.offlineVideos.stopObserver(); // connection lost, keep local db active
        this.videos = this.offlineVideos.find({}).fetch(); // use old videos
      }        

    });
    
  }

  playVideo(id:string) {
     let video = VideosCollection.findOne(id);
     console.log(video);
     if(video.fullPath) {
        VideoPlayer.play(video.fullPath).then(() => {
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
         text: 'Upload',
         handler: () => {
           console.log('Upload clicked');
         }
       },
       {
         text: 'Remove',
         handler: () => {
           console.log('Remove clicked');
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
