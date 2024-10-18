import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AlertController } from '@ionic/angular';
import { ServicebdService } from 'src/app/services/servicebd.service';
import { Usuario } from 'src/app/services/usuario';
import { Camera, CameraResultType } from '@capacitor/camera';
import { NgForm } from '@angular/forms'; // Asegúrate de importar esto

@Component({
  selector: 'app-editarusuario',
  templateUrl: './editarusuario.page.html',
  styleUrls: ['./editarusuario.page.scss'],
})
export class EditarusuarioPage {
  usuario: Usuario = {
    id: 0,
    nombre: '',
    email: '',
    contrasenia: '',
    telefono: 0,
    fecha_registro: '',
    es_admin: false,
    imagen: ''
  };

  constructor(
    private router: Router,
    private bd: ServicebdService,
    private alertController: AlertController
  ) {
    const navigation = this.router.getCurrentNavigation();
    if (navigation?.extras?.state) {
      this.usuario = navigation.extras.state['usuario'];
    }
  }

  async takePicture() {
    const image = await Camera.getPhoto({
      quality: 90,
      allowEditing: false,
      resultType: CameraResultType.Uri
    });
  
    if (image?.webPath) {
      this.usuario.imagen = image.webPath; 
    }
  }

  async guardarCambios(form: NgForm) {
    if (form.valid) {
      try {
        await this.bd.actualizarUsuario(this.usuario);
        this.presentAlert('Éxito', 'Usuario actualizado correctamente.');
        this.router.navigate(['/administrador']);
      } catch (e) {
        this.presentAlert('Error', 'No se pudo actualizar el usuario.');
      }
    } else {
      this.presentAlert('Error', 'Por favor, completa todos los campos.');
    }
  }

  async presentAlert(header: string, message: string) {
    const alert = await this.alertController.create({
      header,
      message,
      buttons: ['OK'],
    });
    await alert.present();
  }
}
