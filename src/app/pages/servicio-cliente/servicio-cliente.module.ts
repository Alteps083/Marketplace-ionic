import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms'; // Importa ReactiveFormsModule
import { IonicModule } from '@ionic/angular';
import { ServicioClientePageRoutingModule } from './servicio-cliente-routing.module';
import { ServicioClientePage } from './servicio-cliente.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule,
    ServicioClientePageRoutingModule
  ],
  declarations: [ServicioClientePage]
})
export class ServicioClientePageModule {}
