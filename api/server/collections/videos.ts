import { MongoObservable } from 'meteor-rxjs';
import { Video } from '../models';

export const VideosCollection = new Mongo.Collection<Video>('videos');
export const Videos = new MongoObservable.Collection(VideosCollection);