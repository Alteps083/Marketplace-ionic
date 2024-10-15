import { Component, OnInit } from '@angular/core';
import { ServicebdService } from 'src/app/services/servicebd.service';
import { AlertController } from '@ionic/angular';

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

  profileImage: string | null = null;

  constructor(private bd: ServicebdService, private alertCtrl: AlertController) { }

  async ngOnInit() {
    const usuarioActual = this.bd.getUsuarioActual();
    if (usuarioActual && usuarioActual.nombre) {
      this.profileImage = await this.bd.obtenerImagenUsuario(usuarioActual.nombre);
      this.reclamo.email = usuarioActual.email; // Asignar el email del usuario actual al formulario
    }
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
}
