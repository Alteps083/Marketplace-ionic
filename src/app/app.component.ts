import { Component } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { every } from 'rxjs';
import { register } from 'swiper/element/bundle';
import { ServicebdService } from './services/servicebd.service';
import { LoadingController, ModalController } from '@ionic/angular';
import { PantallaCargaComponent } from './components/pantalla-carga/pantalla-carga.component';
register();

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent {
  VerMenu = true;

  constructor(private cargarPagina: ModalController,private router: Router , private bd: ServicebdService) {
    this.router.events.subscribe((event) =>{
      if(event instanceof NavigationEnd) {
        this.updateMenuVisibility(event.url)
      }
    });
    this.bd.crearConexion();
    this.initializeApp();
  }

  async initializeApp() {
    const loading = await this.cargarPagina.create({
      component: PantallaCargaComponent, 
      componentProps: {
      },
      cssClass: 'loading-modal', 
    });

    await loading.present();

    await this.loadData();

    await loading.dismiss(); 
  }

  async loadData() {
    return new Promise(resolve => setTimeout(resolve, 3000)); 
  }

  updateMenuVisibility(url: string){
    const hiddenRoutes = ['/login', '/register', '/cambiarcontra'];
    this.VerMenu = !hiddenRoutes.includes(url);
  }
}
