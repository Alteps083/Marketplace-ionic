import { Component, OnInit } from '@angular/core';
import { ServicebdService } from 'src/app/services/servicebd.service';
import { AlertController } from '@ionic/angular';
import { Usuario } from 'src/app/services/usuario';
import { Router } from '@angular/router';
import { NativeStorage } from '@awesome-cordova-plugins/native-storage/ngx';


@Component({
  selector: 'app-servicio-cliente',
  templateUrl: './servicio-cliente.page.html',
  styleUrls: ['./servicio-cliente.page.scss'],
})
export class ServicioClientePage implements OnInit {

  reclamo = {
    email: '',
    tipoProblema: '',
    descripcion: ''
  };

  usuario: Usuario | null = null;

  profileImage: string | null = null;

  constructor(private bd: ServicebdService, private alertCtrl: AlertController, private router:Router, private storage: NativeStorage) { }

  async ngOnInit() {
    this.usuario = this.bd.getUsuarioActual();
    if (this.usuario?.id !== undefined) {
      this.profileImage = await this.bd.obtenerImagenUsuario(this.usuario.id);
    } else {
      console.error('El ID del usuario no está definido.');
      this.profileImage = 'ruta/a/nouser.png'; // Imagen predeterminada en caso de error
    }
    this.cargarUsuario();
  }

  cargarUsuario() {
    this.storage.getItem('usuario').then(async (data: Usuario) => {
      if (data) {
        this.usuario = data;
        try {
          this.profileImage = await this.bd.obtenerImagenUsuario(this.usuario?.id || 0); // Aquí puedes usar 0 o un ID predeterminado
        } catch (error) {
          console.log('Error al cargar la imagen de perfil:', error);
        }
      }
    }).catch(error => {
      console.log('Error al recuperar usuario: ', JSON.stringify(error));
    });
  }

  async enviarReclamo() {
    if (this.reclamo.email && this.reclamo.tipoProblema && this.reclamo.descripcion) {
      try {
        // Guardar en la base de datos
        await this.bd.agregarReclamo(this.reclamo.email, this.reclamo.tipoProblema, this.reclamo.descripcion);

        // Mostrar alerta de éxito
        const alert = await this.alertCtrl.create({
          header: 'Reclamo enviado',
          message: 'Tu reclamo ha sido enviado exitosamente.',
          buttons: ['OK']
        });
        await alert.present();

        // Limpiar el formulario
        this.reclamo = { email: this.reclamo.email, tipoProblema: '', descripcion: '' }; // Conservar el email y limpiar los otros campos
      } catch (e) {
        // Mostrar alerta de error en caso de fallo al guardar el reclamo
        const alert = await this.alertCtrl.create({
          header: 'Error',
          message: 'Hubo un error al enviar el reclamo. Inténtalo de nuevo.',
          buttons: ['OK']
        });
        await alert.present();
      }
    } else {
      // Mostrar alerta si faltan campos por completar
      const alert = await this.alertCtrl.create({
        header: 'Error',
        message: 'Por favor, completa todos los campos.',
        buttons: ['OK']
      });
      await alert.present();
    }
  }

  perfil(){
    this.router.navigate(['tabs/perfil'])
  }
}
