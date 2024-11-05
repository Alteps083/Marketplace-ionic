import { Component, OnInit } from '@angular/core';
import { NativeStorage } from '@awesome-cordova-plugins/native-storage/ngx';
import { ServicebdService } from 'src/app/services/servicebd.service';
import { Usuario } from 'src/app/services/usuario';
import { NotificationsPushService } from 'src/app/services/notifications-push.service';
import { Notificacion } from 'src/app/services/notificacion';
import { ActivatedRoute, Router } from '@angular/router';
import { Producto } from 'src/app/services/producto';

@Component({
  selector: 'app-notificaciones',
  templateUrl: './notificaciones.page.html',
  styleUrls: ['./notificaciones.page.scss'],
})
export class NotificacionesPage implements OnInit {
  profileImage: string | null = null;
  usuario: Usuario | null = null;
  notificaciones: Notificacion[] = [];

  constructor(private bd: ServicebdService, private storage: NativeStorage, private notificacion: NotificationsPushService, private router: Router, private route: ActivatedRoute) { }

  async ngOnInit() {
    await this.notificacion.loadNotifications();
    this.notificacion.notifications$.subscribe(notifications => {
      this.notificaciones = notifications;
    });
    
    const usuarioActual = this.bd.getUsuarioActual();
    this.cargarUsuario();
    if (usuarioActual && usuarioActual.nombre) {
      this.profileImage = await this.bd.obtenerImagenUsuario(this.usuario?.id || 0);
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
      this.notificacion.loadNotifications(); // Vuelve a cargar las notificaciones después de eliminar
    } else {
      console.error('No se puede eliminar la notificación, el ID es undefined');
    }
  }

  irAlProducto(notificacion: Notificacion) {
    this.router.navigate(['/detalle', { id: notificacion.id }]); 
  }

  perfil(){
    this.router.navigate(['/tabs/perfil'])
  }

}
