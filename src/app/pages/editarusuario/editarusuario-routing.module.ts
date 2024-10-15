import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { EditarusuarioPage } from './editarusuario.page';

const routes: Routes = [
  {
    path: '',
    component: EditarusuarioPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class EditarusuarioPageRoutingModule {}
