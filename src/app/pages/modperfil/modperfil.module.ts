import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ModperfilPageRoutingModule } from './modperfil-routing.module';

import { ModperfilPage } from './modperfil.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ModperfilPageRoutingModule
  ],
  declarations: [ModperfilPage]
})
export class ModperfilPageModule {}
