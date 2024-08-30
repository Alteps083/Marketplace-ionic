import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ModcontraPageRoutingModule } from './modcontra-routing.module';

import { ModcontraPage } from './modcontra.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ModcontraPageRoutingModule
  ],
  declarations: [ModcontraPage]
})
export class ModcontraPageModule {}
