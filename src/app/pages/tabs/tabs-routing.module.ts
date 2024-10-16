import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TabsPage } from './tabs.page';

const routes: Routes = [
  {
    path: '',
    component: TabsPage,
    children: [
      {
        path: 'home',
        loadChildren: () => import('../../home/home.module').then(m => m.HomePageModule) 
      },
      {
        path: 'notificaciones',
        loadChildren: () => import('../notificaciones/notificaciones.module').then(m => m.NotificacionesPageModule) 
      },
      {
        path: 'perfil',
        loadChildren: () => import('../perfil/perfil.module').then(m => m.PerfilPageModule)
      },
      {
        path: 'homeadmin',
        loadChildren: () => import('../homeadmin/homeadmin.module').then(m => m.HomeadminPageModule) 
      },
      {
        path: 'agregar',
        loadChildren: () => import('../agregar/agregar.module').then(m => m.AgregarPageModule) 
      },
      {
        path: 'servicio-cliente',
        loadChildren: () => import('../servicio-cliente/servicio-cliente.module').then(m => m.ServicioClientePageModule) 
      },
      {
        path: '',
        redirectTo: 'home',
        pathMatch: 'full'
      },
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TabsPageRoutingModule {}