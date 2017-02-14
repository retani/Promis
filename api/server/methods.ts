import { Videos } from './collections'

Meteor.methods({
   createVideo(fullPath: string): void {
   		Videos.collection.insert({
  			fullPath: fullPath
    	});
   },
   removeVideo(id: string): void {
   		let video = Videos.findOne(id)
   		Videos.collection.remove({_id: id})
   }
});