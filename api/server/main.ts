import { Meteor } from 'meteor/meteor';
//import { S3 } from 'meteor/lepozepo:s3';
declare var process: any;
declare var S3: any;

S3.config = {
    key: process.env.PROMIS_S3_KEY,
    secret: process.env.PROMIS_S3_SECRET,
    bucket: 'promis-dev'
};

Meteor.startup(() => {
  // code to run on server at startup
});


  



