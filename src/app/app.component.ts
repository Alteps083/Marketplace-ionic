import { Component } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { every } from 'rxjs';
import { register } from 'swiper/element/bundle';
import { ServicebdService } from './services/servicebd.service';
import { Platform, AlertController } from '@ionic/angular';
import { Keyboard } from '@capacitor/keyboard';
import { environment } from 'src/environments/environment';
import { Location } from '@angular/common';
import { LoadingController, ModalController } from '@ionic/angular';
import { PantallaCargaComponent } from './components/pantalla-carga/pantalla-carga.component';
import { NotificationsPushService } from './services/notifications-push.service';
import { Capacitor } from '@capacitor/core';
import { App } from '@capacitor/app';
import { Usuario } from './services/usuario';
import { MenuController } from '@ionic/angular';
import { NativeStorage } from '@awesome-cordova-plugins/native-storage/ngx';
register();

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent {
  VerMenu = true;

  usuario: Usuario | null = null;

  constructor(private cargarPagina: ModalController,private router: Router , private bd: ServicebdService, private menu: MenuController, private platform: Platform, private storage: NativeStorage, private alertController: AlertController, private location: Location) {
    this.router.events.subscribe((event) =>{
      if(event instanceof NavigationEnd) {
        this.updateMenuVisibility(event.url)
      }
    });
    this.bd.crearConexion();
  }

  ngOnInit(){
    this.initializeApp();
  }

  async initializeApp() {
    await this.bd.cargarUsuarioActual();
    await this.bd.cargarUsuarios();
    await this.bd.verificarYAgregarColumnaEstado();
    const loading = await this.cargarPagina.create({
      component: PantallaCargaComponent, 
      componentProps: {
      },
      cssClass: 'loading-modal', 
    });

    await loading.present();

    await this.loadData();

    await loading.dismiss(); 

    this.platform.ready().then(() => {
      this.platform.backButton.subscribeWithPriority(10, async () => {
        if (this.router.url === '/tabs/home') { 
          const alert = await this.alertController.create({
            header: 'Cerrar sesión',
            message: '¿Estás seguro de que deseas cerrar sesión?',
            buttons: [
              {
                text: 'Cancelar',
                role: 'cancel',
              },
              {
                text: 'Cerrar sesión',
                handler: async () => {
                  await this.storage.clear(); 
                  this.router.navigate(['/login']); 
                },
              },
            ],
          });
          await alert.present();
        } else if (this.router.url === '/login') { 
          const alert = await this.alertController.create({
            header: 'Salir de la aplicación',
            message: '¿Estás seguro de que deseas salir de la aplicación?',
            buttons: [
              {
                text: 'Cancelar',
                role: 'cancel',
              },
              {
                text: 'Salir',
                handler: () => {
                  App.exitApp(); 
                },
              },
            ],
          });
  
          await alert.present();
        } else {
          this.location.back();
        }
      });
    });
  }


  async cerrarSesion() {
    try {
      await this.storage.clear(); // Limpia el almacenamiento de datos
      this.router.navigate(['/login']); // Redirige al login
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  }

  async loadData() {
    return new Promise(resolve => setTimeout(resolve, 3000)); 
  }

  updateMenuVisibility(url: string){
    const hiddenRoutes = ['/login', '/register', '/cambiarcontra'];
    this.VerMenu = !hiddenRoutes.includes(url);
  }

  closeMenu() {
    this.menu.close();
  }

  isAdmin(): boolean {
    const usuarioActual = this.bd.getUsuarioActual();
    return usuarioActual ? usuarioActual.es_admin : false; 
  }
}