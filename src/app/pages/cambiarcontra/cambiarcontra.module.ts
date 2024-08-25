import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { CambiarcontraPageRoutingModule } from './cambiarcontra-routing.module';

import { CambiarcontraPage } from './cambiarcontra.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    CambiarcontraPageRoutingModule
  ],
  declarations: [CambiarcontraPage]
})
export class CambiarcontraPageModule {}
