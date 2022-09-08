import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { NotificationcentrePageRoutingModule } from './notificationcentre-routing.module';

import { NotificationcentrePage } from './notificationcentre.page';
import { NgxProgressiveImgLoaderModule } from 'ngx-progressive-img-loader';
import { TranslateModule } from '@ngx-translate/core';
import { NgPipesModule } from 'ngx-pipes';
@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    NotificationcentrePageRoutingModule,
    NgxProgressiveImgLoaderModule,
    TranslateModule,
    NgPipesModule
  ],
  declarations: [NotificationcentrePage]
})
export class NotificationcentrePageModule { }
