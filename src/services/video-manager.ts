import { Injectable } from '@angular/core';
import { MongoObservable } from 'meteor-rxjs';
import { LocalVideo } from 'api/models';
import { LocalPersist } from 'meteor/jeffm:local-persist'
import { VideoEditor } from 'ionic-native';
declare var S3:any;
declare var window:any;

@Injectable()
export class VideoManager {
  
  private localVideos;
  private localVideosObserver;
  private s3Uploads;
  
  constructor() {
    this.localVideos = new MongoObservable.Collection<LocalVideo>('localvideos', {connection: null});
    this.localVideosObserver = new LocalPersist(this.localVideos.collection, 'promis-localvideos');
  
    // observe uploads collection in S3 package and transfer upload progress
    this.s3Uploads = new MongoObservable.Collection(S3.collection);
    this.s3Uploads.find({})
    .subscribe(files => {
      files.forEach((file) => {
        let video = this.findVideo({filename: file.file.original_name})
        video.uploadProgress = file.percent_uploaded;
        this.updateVideo(video);
      });  
    });
  }

  get videos() {
    return this.localVideos;
  }
 
  addVideo(video: LocalVideo) {
    video.transcoded = false;
    this.localVideos.collection.insert(video);    
  }

  getVideo(id: string) {
    return this.localVideos.collection.findOne(id);
  }

  findVideo(query) {
    return this.localVideos.collection.findOne(query);
  }

  updateVideo(video: LocalVideo) {
    this.localVideos.collection.update({_id: video._id}, video);
  }

  removeVideo(id: string) {
    this.localVideos.collection.remove({_id: id})
  }

  transcodeVideo(id: string) {
    let video = this.getVideo(id)
    let self = this;
    let options = {
      fileUri: video.originalPath,
      outputFileName: "transcode_" + video._id,
      outputFileType: VideoEditor.OutputFileType.MPEG4,
      optimizeForNetworkUse: VideoEditor.OptimizeForNetworkUse.YES,
      saveToLibrary: true,
      maintainAspectRatio: true,
      width: 480,
      height: 360,
      videoBitrate: 1333333, // 1 megabit
      audioChannels: 2,
      audioSampleRate: 44100,
      audioBitrate: 128000, // 128 kilobits
      progress: function(info) {
        console.log("progress: " + info);
        video.transcoded = false;
        video.transcodeProgress = info;
        self.updateVideo(video);
      }
    }
    console.log("transcodeVideo options " + JSON.stringify(options))
    VideoEditor.transcodeVideo(options)
      .then((fileUri: string) => {
        console.log('video transcode success, saving to: ' + fileUri);
        video.transcoded = true;
        video.transcodedPath = fileUri;
        this.updateVideo(video);
      })
      .catch((error: any) => console.log('video transcode error ' + JSON.stringify(error)));
  }

  uploadVideo(id:string) {
    let video = this.getVideo(id)
    let self = this;
    window.resolveLocalFileSystemURL("file://" + video.transcodedPath, 
      function(fileEntry) {
        fileEntry.file(function(file) {
          video.filename = file.name;
          self.updateVideo(video);
          var xhr = new XMLHttpRequest();
          xhr.open(
          /* method */ "GET",
          /* file */ video.transcodedPath,
          /* async */ true
          );
          xhr.responseType = "arraybuffer";
          xhr.onload = function(evt) {
            var blob = new Blob([xhr.response], {type: file.type});
            blob['name'] = file.name;
            console.log("attempting upload with");
            console.log(JSON.stringify(blob));
            S3.upload({
              files:[blob],
              path:"videos"
            }, function(e, r) {
                console.log("S3 callback")
                if(e) {
                  console.log(JSON.stringify(e));  
                } else {
                  console.log(JSON.stringify(r));
                  // update local video
                  video.uploaded = true;
                  self.updateVideo(video);

                  // todo: create remote video object
                }                
            });
          }
          xhr.send(null);          
        });
      },
      function(e) {
        console.log(JSON.stringify(e));
      }
    );

  }

  
}