import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ServicioClientePageRoutingModule } from './servicio-cliente-routing.module';

import { ServicioClientePage } from './servicio-cliente.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ServicioClientePageRoutingModule
  ],
  declarations: [ServicioClientePage]
})
export class ServicioClientePageModule {}
