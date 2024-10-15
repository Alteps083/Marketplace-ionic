import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { EditarproductoPage } from './editarproducto.page';

const routes: Routes = [
  {
    path: '',
    component: EditarproductoPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class EditarproductoPageRoutingModule {}
