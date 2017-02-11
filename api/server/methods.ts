import { Videos } from './collections'

Meteor.methods({
   createVideo(fullPath: string): void {
   		Videos.collection.insert({
  			fullPath: fullPath
    	});
   }
});