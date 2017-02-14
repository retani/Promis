import { Injectable } from '@angular/core';
import { LocalVideos } from 'api/connections'
import { MeteorObservable } from 'meteor-rxjs';
import { Ground } from 'meteor/ground:db'

@Injectable()
export class StorageManager {
  
  private localVideos;

  constructor() {
    this.localVideos = new Ground.Collection('localVideos');
    this.localVideos.observeSource(LocalVideos.find());
  }

  getVideo(id: string) {
    return this.localVideos.findOne(id);
  }

  getVideos() {
    if(Meteor.status().status.toString() == "connected") {
      return LocalVideos.find({}).fetch()
    } else {
      return this.localVideos.find({}).fetch();  
    }
  }

  addVideo(path) {
    MeteorObservable.call('createVideo', path).subscribe({
      next: () => console.log("success"),
      error: (err: Error) => console.log(err)
    });
  }

  removeVideo(id) {
    MeteorObservable.call('removeVideo', id).subscribe({
      next: () => console.log("sucecss"),
      error: (err: Error) => console.log(err)
    });
  }
  

  
}