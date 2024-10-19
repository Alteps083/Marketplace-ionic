import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  },
  {
    path: 'login',
    loadChildren: () => import('./pages/login/login.module').then( m => m.LoginPageModule)
  },
  {
    path: 'registro',
    loadChildren: () => import('./pages/registro/registro.module').then( m => m.RegistroPageModule)
  },
  {
    path: 'modperfil',
    loadChildren: () => import('./pages/modperfil/modperfil.module').then( m => m.ModperfilPageModule)
  },
  {
    path: 'modificar',
    loadChildren: () => import('./pages/modificar/modificar.module').then( m => m.ModificarPageModule)
  },
  {
    path: 'mis-productos',
    loadChildren: () => import('./pages/mis-productos/mis-productos.module').then( m => m.MisProductosPageModule)
  },
  {
    path: 'agregar',
    loadChildren: () => import('./pages/agregar/agregar.module').then( m => m.AgregarPageModule)
  },
  {
    path: 'detalle/:id',
    loadChildren: () => import('./pages/detalle/detalle.module').then( m => m.DetallePageModule)
  },
  {
    path: 'modperfil',
    loadChildren: () => import('./pages/modperfil/modperfil.module').then( m => m.ModperfilPageModule)
  },
  {
    path: 'modcontra',
    loadChildren: () => import('./pages/modcontra/modcontra.module').then( m => m.ModcontraPageModule)
  },
  {
    path: 'tabs',
    loadChildren: () => import('./pages/tabs/tabs.module').then( m => m.TabsPageModule)
  },
  {
    path: 'notificaciones',
    loadChildren: () => import('./pages/notificaciones/notificaciones.module').then( m => m.NotificacionesPageModule)
  },
  {
    path: 'mis-productos',
    loadChildren: () => import('./pages/mis-productos/mis-productos.module').then( m => m.MisProductosPageModule)
  },
  {
    path: 'servicio-cliente',
    loadChildren: () => import('./pages/servicio-cliente/servicio-cliente.module').then( m => m.ServicioClientePageModule)
  },
  {
    path: 'administrador',
    loadChildren: () => import('./pages/administrador/administrador.module').then( m => m.AdministradorPageModule)
  },
  {
    path: 'editarusuario',
    loadChildren: () => import('./pages/editarusuario/editarusuario.module').then( m => m.EditarusuarioPageModule)
  },
  {
    path: 'editarproducto',
    loadChildren: () => import('./pages/editarproducto/editarproducto.module').then( m => m.EditarproductoPageModule)
  },
  {
    path: '**',
    loadChildren: () => import('./pages/notfound/notfound.module').then( m => m.NotfoundPageModule)
  },










];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
