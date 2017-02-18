import { VideoEditor, Transfer } from 'ionic-native';
import { Injectable } from '@angular/core';
import { MongoObservable } from 'meteor-rxjs';
import { LocalVideo } from 'api/models';
import { LocalPersist } from 'meteor/jeffm:local-persist'
import { RemoteVideos } from 'api/collections'
declare var S3:any;
declare var window: any;
declare var cordova: any;
declare var device: any;

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

  get remoteVideos() {
    return RemoteVideos
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

  removeRemoteVideo(id: string) {
    RemoteVideos.collection.remove({_id: id})

    // this will only work for the same device that video was uploaded from
    let lv = this.videos.findOne({remoteId: id});
    lv.uploaded = false;
    this.updateVideo(lv);
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
                  // create remote video object
                  let remoteId = RemoteVideos.collection.insert({
                    url: r.url,
                    relativeUrl: r.relative_url,
                    filename: r.file.name,
                    type: r.file.type,
                    size: r.file.size,                    
                    deviceUuid: video.deviceUuid,
                    system: video.system
                  });

                  // update local video
                  video.uploaded = true;
                  video.downloaded = true;
                  video.remoteId = remoteId;
                  self.updateVideo(video);
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

  downloadRemote(id) {
    let rv = RemoteVideos.findOne(id);
    console.log(JSON.stringify(rv));
    
    let localId = this.localVideos.collection.insert({
        remoteId: id,

        deviceUuid: rv.deviceUuid,
        system: rv.system,
        localAuthor: (rv.deviceUuid == device.uuid),

        filename: rv.filename,
        transcoded: false,
        uploaded: false,
       
        downloadProgress: 0,
        downloaded: false,
      })      
    let lv = this.getVideo(localId);
    let lvId = lv._id;
    
    const fileTransfer = new Transfer();
    let url = rv.url;
    let self = this;
    fileTransfer.onProgress((data) => {
      console.log(JSON.stringify(data));
      if(data.lengthComputable) {
        let progress = data.loaded / data.total;
        self.localVideos.collection.update({_id: lvId}, {$set: {downloadProgress: progress}});
      }
    })
    fileTransfer.download(url, cordova.file.dataDirectory + rv.filename).then((entry) => {
      console.log('download complete: ' + entry.toURL());

      lv.transcoded = true;
      lv.transcodedPath = entry.toURL();        
      lv.downloaded = true;
      this.updateVideo(lv);
      
    }, (error) => {
      // handle error
    });

  }

}