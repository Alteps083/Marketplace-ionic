import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { OlvidoContraseniaPage } from './olvido-contrasenia.page';

const routes: Routes = [
  {
    path: '',
    component: OlvidoContraseniaPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class OlvidoContraseniaPageRoutingModule {}
