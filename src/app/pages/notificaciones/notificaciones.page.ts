import { Component, OnInit } from '@angular/core';
import { NativeStorage } from '@awesome-cordova-plugins/native-storage/ngx';
import { ServicebdService } from 'src/app/services/servicebd.service';
import { Usuario } from 'src/app/services/usuario';
import { NotificationsPushService } from 'src/app/services/notifications-push.service';
import { Notificacion } from 'src/app/services/notificacion';
@Component({
  selector: 'app-notificaciones',
  templateUrl: './notificaciones.page.html',
  styleUrls: ['./notificaciones.page.scss'],
})
export class NotificacionesPage implements OnInit {
  profileImage: string | null = null;
  usuario: Usuario | null = null;
  notificaciones: Notificacion[] = [];

  constructor(private bd: ServicebdService, private storage: NativeStorage, private notificacion: NotificationsPushService) { }

  async ngOnInit() {
    this.notificacion.notifications$.subscribe((data: Notificacion[]) => {
      this.notificaciones = data
    })
    const usuarioActual = this.bd.getUsuarioActual();
    this.cargarUsuario();
    if (usuarioActual && usuarioActual.nombre) {
      this.profileImage = await this.bd.obtenerImagenUsuario(usuarioActual.nombre);
    }
  }

  cargarUsuario() {
    this.storage.getItem('usuario').then(async (data: Usuario) => {
      if (data) {
        this.usuario = data;
        try {
          this.profileImage = await this.bd.obtenerImagenUsuario(this.usuario.nombre);
        } catch (error) {
          console.log('Error al cargar la imagen de perfil:', error);
        }
      }
    }).catch(error => {
      console.log('Error al recuperar usuario: ', JSON.stringify(error));
    });
  }

}
