import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ServicioClientePage } from './servicio-cliente.page';

const routes: Routes = [
  {
    path: '',
    component: ServicioClientePage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ServicioClientePageRoutingModule {}
