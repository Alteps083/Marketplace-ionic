import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { CambiarcontraPage } from './cambiarcontra.page';

const routes: Routes = [
  {
    path: '',
    component: CambiarcontraPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CambiarcontraPageRoutingModule {}
