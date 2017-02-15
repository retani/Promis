import { Injectable } from '@angular/core';
import { MongoObservable } from 'meteor-rxjs';
import { LocalVideo } from 'api/models';
import { LocalPersist } from 'meteor/jeffm:local-persist'

@Injectable()
export class StorageManager {
  
  private localVideos;
  private localVideosObserver;
  
  constructor() {
    this.localVideos = new MongoObservable.Collection<LocalVideo>('localvideos', {connection: null});
    this.localVideosObserver = new LocalPersist(this.localVideos.collection, 'promis-localvideos');
  }

  get videos() {
    return this.localVideos.find({});
  }
 
  addVideo(path) {
    this.localVideos.collection.insert({
      localPath: path
    });    
  }

  getVideo(id: string) {
    return this.localVideos.collection.findOne(id);
  }

  removeVideo(id: string) {
    this.localVideos.collection.remove({_id: id})
  }
  
}