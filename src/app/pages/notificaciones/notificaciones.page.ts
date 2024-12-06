import { Component, OnInit } from '@angular/core';
import { NativeStorage } from '@awesome-cordova-plugins/native-storage/ngx';
import { ServicebdService } from 'src/app/services/servicebd.service';
import { Usuario } from 'src/app/services/usuario';
import { NotificationsPushService } from 'src/app/services/notifications-push.service';
import { Notificacion } from 'src/app/services/notificacion';
import { ActivatedRoute, Router } from '@angular/router';
import { Producto } from 'src/app/services/producto';
import { AlertController } from '@ionic/angular';
import { RazonEliminacion } from 'src/app/services/RazonEliminacion';



@Component({
  selector: 'app-notificaciones',
  templateUrl: './notificaciones.page.html',
  styleUrls: ['./notificaciones.page.scss'],
})
export class NotificacionesPage implements OnInit {
  profileImage: string | null = null;
  usuario: Usuario | null = null;
  notificaciones: Notificacion[] = [];

  razonesEliminacion: RazonEliminacion[] = []; 
  isListaVisible: boolean = false;

  constructor(private bd: ServicebdService, private storage: NativeStorage, private notificacion: NotificationsPushService, private router: Router, private route: ActivatedRoute, private alertController: AlertController) { }

  async ngOnInit() {
    this.mostrarRazonesEliminacion();
    this.bd.obtenerRazonesEliminacion().then(razones => {
      console.log('Datos obtenidos de SQLite:', razones); // Paso 1
      this.razonesEliminacion = razones || [];
      console.log('Razones asignadas a la propiedad:', this.razonesEliminacion); // Paso 2
    }).catch(error => {
      console.error('Error al cargar razones de eliminación:', error);
    });
    await this.cargarRazonesEliminacion();
  
    // Carga las notificaciones
    await this.notificacion.loadNotifications();
    this.notificacion.notifications$.subscribe(notifications => {
      this.notificaciones = notifications;
    });
  
    // Carga el usuario actual y su imagen
    const usuarioActual = this.bd.getUsuarioActual();
    this.cargarUsuario();
    if (usuarioActual && usuarioActual.nombre) {
      this.profileImage = await this.bd.obtenerImagenUsuario(usuarioActual.id || 0);
    }
  }

  cargarUsuario() {
    this.storage.getItem('usuario').then(async (data: Usuario) => {
      if (data) {
        this.usuario = data;
        try {
          this.profileImage = await this.bd.obtenerImagenUsuario(this.usuario?.id || 0);
        } catch (error) {
          console.log('Error al cargar la imagen de perfil:', error);
        }
      }
    }).catch(error => {
      console.log('Error al recuperar usuario: ', JSON.stringify(error));
    });
  }

  eliminarNotificacion(id: number | undefined) {
    if (id !== undefined) {
      this.notificacion.deleteNotification(id);
      this.notificacion.loadNotifications(); 
    } else {
      console.error('No se puede eliminar la notificación, el ID es undefined');
    }
  }

  irAlBuscar() {
    this.router.navigate(['/busqueda']); 
  }

  perfil(){
    this.router.navigate(['/tabs/perfil'])
  }

    // Mostrar razones de eliminación en un modal de alerta
    mostrarRazonesEliminacion() {
      if (this.razonesEliminacion.length > 0) {
        console.log('Razones a mostrar:', this.razonesEliminacion);
        // Aquí podrías implementar un modal o lista para mostrar las razones.
      }
    }
  
    // Presentar una alerta si no hay razones
    async presentAlert(header: string, message: string) {
      const alert = await this.alertController.create({
        header,
        message,
        buttons: ['Aceptar']
      });
  
      await alert.present();
    }
    
      // Método para cargar las razones de eliminaciónrazonesEliminacion
      async cargarRazonesEliminacion() {
        try {
          const razones = await this.bd.obtenerRazonesEliminacion();
          if (razones && razones.length > 0) {
            this.razonesEliminacion = razones;
            console.log('Razones de eliminación cargadas:', this.razonesEliminacion);
          } else {
            console.log('No hay razones de eliminación registradas.');
            this.presentAlert('Sin razones', 'No hay razones de eliminación registradas.');
          }
        } catch (error) {
          console.error('Error al cargar razones de eliminación:', error);
          this.presentAlert('Error', 'Hubo un problema al cargar las razones de eliminación.');
        }
      }
      
      toggleListaRazones() {
        this.isListaVisible = !this.isListaVisible; // Alterna entre true y false
      }
      
}
