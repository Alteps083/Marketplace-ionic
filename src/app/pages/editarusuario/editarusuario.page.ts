import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AlertController } from '@ionic/angular';
import { ServicebdService } from 'src/app/services/servicebd.service';
import { Usuario } from 'src/app/services/usuario';

interface NavigationExtras {
  state?: {
    usuario: Usuario;
  };
}

@Component({
  selector: 'app-editarusuario',
  templateUrl: './editarusuario.page.html',
  styleUrls: ['./editarusuario.page.scss'],
})
export class EditarusuarioPage {
  usuario: Usuario;

  constructor(
    private router: Router,
    private bd: ServicebdService,
    private alertController: AlertController
  ) {
    const navigation = this.router.getCurrentNavigation() as NavigationExtras;
    this.usuario = navigation?.state?.['usuario'] || this.getDefaultUsuario(); // Inicializa con un objeto por defecto
  }

  private getDefaultUsuario(): Usuario {
    return {
      id: 0,
      nombre: '',
      email: '',
      contrasenia: '',
      telefono: 0,
      fecha_registro: '',
      es_admin: false,
      imagen: ''
    };
  }

  async guardarCambios() {
    try {
      await this.bd.actualizarUsuario(this.usuario); // Implementa este método en tu servicio
      this.presentAlert('Éxito', 'Usuario actualizado correctamente.');
      this.router.navigate(['/administrador']); // Regresar a la página del administrador
    } catch (e) {
      this.presentAlert('Error', 'No se pudo actualizar el usuario.');
    }
  }

  async presentAlert(header: string, message: string) {
    const alert = await this.alertController.create({
      header,
      message,
      buttons: ['OK']
    });

    await alert.present();
  }
}
