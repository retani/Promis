import { NgModule, ErrorHandler } from '@angular/core';
import { IonicApp, IonicModule, IonicErrorHandler } from 'ionic-angular';
import { MyApp } from './app.component';
import { ListPage } from '../pages/list/list';
import { MapPage } from '../pages/map/map';
import { NewPage } from '../pages/new/new';
import { TabsPage } from '../pages/tabs/tabs';
import { VideoManager } from '../services/video-manager';
import { MapOptionsComponent } from '../pages/map/map-options';


@NgModule({
  declarations: [
    MyApp,
    ListPage,
    MapPage,
    NewPage,
    TabsPage,
    MapOptionsComponent
  ],
  imports: [
    IonicModule.forRoot(MyApp)
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp,
    ListPage,
    MapPage,
    NewPage,
    TabsPage,
    MapOptionsComponent
  ],
  providers: [{provide: ErrorHandler, useClass: IonicErrorHandler}, VideoManager]
})
export class AppModule {}
