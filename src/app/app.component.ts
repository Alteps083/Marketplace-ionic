import { Component } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { every } from 'rxjs';
import { register } from 'swiper/element/bundle';
import { ServicebdService } from './services/servicebd.service';
import { Platform } from '@ionic/angular';
import { Keyboard } from '@capacitor/keyboard';
import { environment } from 'src/environments/environment';
import { LoadingController, ModalController } from '@ionic/angular';
import { PantallaCargaComponent } from './components/pantalla-carga/pantalla-carga.component';
import { NotificationsPushService } from './services/notifications-push.service';
import { Capacitor } from '@capacitor/core';
register();

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent {
  VerMenu = true;

  constructor(private cargarPagina: ModalController,private router: Router , private bd: ServicebdService, private platform: Platform, private notifications: NotificationsPushService) {
    this.router.events.subscribe((event) =>{
      if(event instanceof NavigationEnd) {
        this.updateMenuVisibility(event.url)
      }
    });
    this.bd.crearConexion();
  }

  ngOnInit(){
    this.eventosTeclado()
  }


  async initializeApp() {
    this.platform.ready().then(() => {
      this.eventosTeclado();
    
    })
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

  eventosTeclado(){
    Keyboard.addListener('keyboardWillShow', (info) => {
      document.body.style.paddingBottom = info.keyboardHeight + 'px';
    })

    Keyboard.addListener('keyboardWillHide', () => {
      document.body.style.paddingBottom = '0px'
    })
  }

  async loadData() {
    return new Promise(resolve => setTimeout(resolve, 3000)); 
  }

  updateMenuVisibility(url: string){
    const hiddenRoutes = ['/login', '/register', '/cambiarcontra'];
    this.VerMenu = !hiddenRoutes.includes(url);
  }
}
