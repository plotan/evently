import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { TicketsPageRoutingModule } from './tickets-routing.module';

import { TicketsPage } from './tickets.page';
import { NgxProgressiveImgLoaderModule } from 'ngx-progressive-img-loader';
import { TranslateModule } from '@ngx-translate/core';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    TicketsPageRoutingModule,
    NgxProgressiveImgLoaderModule,
    TranslateModule
  ],
  declarations: [TicketsPage]
})
export class TicketsPageModule {}
