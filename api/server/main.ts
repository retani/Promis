import { Meteor } from 'meteor/meteor';
import { Videos } from './collections'

Meteor.startup(() => {
  // code to run on server at startup
  if (Videos.find({}).cursor.count() === 0) {
  	Videos.collection.insert({
  		fullPath: "foo"
    });
  }
});
