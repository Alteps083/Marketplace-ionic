import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { MisProductosPage } from './mis-productos.page';

const routes: Routes = [
  {
    path: '',
    component: MisProductosPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class MisProductosPageRoutingModule {}
