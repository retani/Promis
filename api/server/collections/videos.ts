import { MongoObservable } from 'meteor-rxjs';
import { Video } from '../models';
 
export const Videos = new MongoObservable.Collection<Video>('videos');