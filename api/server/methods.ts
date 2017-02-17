import { RemoteVideos } from './collections'
import { RemoteVideo } from './models'

Meteor.methods({

 addRemoteVideo(video: RemoteVideo) {
    this.localVideos.collection.insert(video);    
 }






});