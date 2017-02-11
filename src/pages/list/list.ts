import { Component } from '@angular/core';

import { NavController } from 'ionic-angular';

@Component({
  selector: 'page-list',
  templateUrl: 'list.html'
})
export class ListPage {

  videos;

  constructor(public navCtrl: NavController) {
  	this.videos = [{title: "video 1"}, {title: "video 2"}];
  }

}
