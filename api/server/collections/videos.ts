import { MongoObservable } from 'meteor-rxjs';
import { LocalVideo } from '../models';

export const LocalVideos = new MongoObservable.Collection<LocalVideo>('localvideos');
