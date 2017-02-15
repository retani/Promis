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
      originalPath: path,
      transcoded: false
    });    
  }

  getVideo(id: string) {
    return this.localVideos.collection.findOne(id);
  }

  updateVideo(video: LocalVideo) {
    this.localVideos.collection.update({_id: video._id}, video);
  }

  removeVideo(id: string) {
    this.localVideos.collection.remove({_id: id})
  }
  
}