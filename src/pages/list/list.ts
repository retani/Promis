import { Component } from '@angular/core';
import { NavController, ActionSheetController } from 'ionic-angular';
import { Video } from 'api/models'
import { MongoObservable } from 'meteor-rxjs';

const Videos = new MongoObservable.Collection<Video>('videos');

@Component({
  selector: 'page-list',
  templateUrl: 'list.html'
})
export class ListPage {

  videos;

  constructor(public navCtrl: NavController, public actionSheetCtrl: ActionSheetController) {}

  ngOnInit() {
    this.videos = Videos.find({}).zone()
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
