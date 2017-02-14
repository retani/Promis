import { LocalVideos } from './collections'

Meteor.methods({
   createVideo(localPath: string): void {
   		LocalVideos.collection.insert({
  			localPath: localPath
    	});
   },
   removeVideo(id: string): void {
   		LocalVideos.collection.remove({_id: id})
   }
});