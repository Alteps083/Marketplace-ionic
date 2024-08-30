import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ModcontraPage } from './modcontra.page';

const routes: Routes = [
  {
    path: '',
    component: ModcontraPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ModcontraPageRoutingModule {}
