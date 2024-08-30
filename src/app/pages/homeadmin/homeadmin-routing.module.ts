import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { HomeadminPage } from './homeadmin.page';

const routes: Routes = [
  {
    path: '',
    component: HomeadminPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class HomeadminPageRoutingModule {}
