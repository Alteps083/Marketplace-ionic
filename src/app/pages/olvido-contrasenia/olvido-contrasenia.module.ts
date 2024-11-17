import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { OlvidoContraseniaPageRoutingModule } from './olvido-contrasenia-routing.module';

import { OlvidoContraseniaPage } from './olvido-contrasenia.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule,
    OlvidoContraseniaPageRoutingModule
  ],
  declarations: [OlvidoContraseniaPage]
})
export class OlvidoContraseniaPageModule {}
