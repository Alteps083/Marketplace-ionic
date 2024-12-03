import { Component, OnInit } from '@angular/core';
import { ServicebdService } from 'src/app/services/servicebd.service';
import { AlertController } from '@ionic/angular';
import { Usuario } from 'src/app/services/usuario';
import { Router } from '@angular/router';
import { NativeStorage } from '@awesome-cordova-plugins/native-storage/ngx';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';


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

  reclamoForm: FormGroup;


  usuario: Usuario | null = null;

  profileImage: string | null = null;

  constructor(private bd: ServicebdService, private alertCtrl: AlertController, private router:Router, private storage: NativeStorage, private fb: FormBuilder) { 
    this.reclamoForm = this.fb.group({
      email: [
        '', 
        [
          Validators.required, 
          Validators.email
        ]
      ],
      tipoProblema: [
        '', 
        Validators.required
      ],
      descripcion: [
        '', 
        [
          Validators.required, 
          Validators.maxLength(100)
        ]
      ]
    });
  }


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
          this.profileImage = await this.bd.obtenerImagenUsuario(this.usuario?.id || 0); // ID predeterminado
        } catch (error) {
          console.log('Error al cargar la imagen de perfil:', error);
        }
      }
    }).catch(error => {
      console.log('Error al recuperar usuario: ', JSON.stringify(error));
    });
  }

  async enviarReclamo() {
    console.log('Email:', this.reclamoForm.get('email')?.value);
console.log('Tipo de problema:', this.reclamoForm.get('tipoProblema')?.value);
console.log('Descripción:', this.reclamoForm.get('descripcion')?.value);

    console.log('Datos del reclamo:', this.reclamoForm.value);
    if (this.reclamoForm.valid) {
      const { email, tipoProblema, descripcion } = this.reclamoForm.value;
      try {
        await this.bd.agregarReclamo(email, tipoProblema, descripcion);

        const alert = await this.alertCtrl.create({
          header: 'Reclamo enviado',
          message: 'Tu reclamo ha sido enviado exitosamente.',
          buttons: ['OK']
        });
        console.log('Reclamo agregado exitosamente');
        await alert.present();

        this.reclamoForm.reset({ email });
      } catch (e) {
        const alert = await this.alertCtrl.create({
          header: 'Error',
          message: 'Hubo un error al enviar el reclamo. Inténtalo de nuevo.',
          buttons: ['OK']
        });
        await alert.present();
        console.error('Error al agregar reclamo:', Error);
      }
    } else {
      console.error('Formulario inválido:', this.reclamoForm.errors);
      const alert = await this.alertCtrl.create({
        header: 'Error',
        message: 'Por favor, completa todos los campos correctamente.',
        buttons: ['OK']
      });
      await alert.present();
    }
  }


  perfil(){
    this.router.navigate(['tabs/perfil'])
  }
}
