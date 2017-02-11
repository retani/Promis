import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import { Video } from 'api/models'
import { MongoObservable } from 'meteor-rxjs';

const Videos = new MongoObservable.Collection<Video>('videos');

@Component({
  selector: 'page-list',
  templateUrl: 'list.html'
})
export class ListPage {

  videos;

  constructor(public navCtrl: NavController) {
  }

  ngOnInit() {
    this.videos = Videos.find({}).zone()
  }

}
