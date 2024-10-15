import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { AgregarPageRoutingModule } from './agregar-routing.module';

import { AgregarPage } from './agregar.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ReactiveFormsModule,
    AgregarPageRoutingModule
  ],
  declarations: [AgregarPage]
})
export class AgregarPageModule {}
