import { MongoObservable } from 'meteor-rxjs';
import { RemoteVideo } from '../models';

export const RemoteVideos = new MongoObservable.Collection<RemoteVideo>('collection');
