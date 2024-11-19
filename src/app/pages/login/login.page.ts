import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AlertController, ToastController } from '@ionic/angular';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Keyboard } from '@capacitor/keyboard';
import { NativeStorage } from '@awesome-cordova-plugins/native-storage/ngx';
import { ServicebdService } from 'src/app/services/servicebd.service';
import { Usuario } from 'src/app/services/usuario';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {
  miFormulario: FormGroup;
  listaUsuarios: Usuario[] = [];
  password: string = '';
  showPassword: boolean = false;
  usuario: string = '';

  constructor(
    private router: Router,
    private toastController: ToastController,
    private formBuilder: FormBuilder,
    private storage: NativeStorage,
    private bd: ServicebdService
  ) {
    this.miFormulario = this.formBuilder.group({
      nombre: ['', [Validators.required, Validators.minLength(3)]],
      password: ['', [Validators.required, Validators.minLength(8)]],
    });
  }

  ionViewWillEnter() {
    this.miFormulario.reset();
  }

  async ngOnInit() {
    this.initializeKeyboardListeners();
    this.iniciarControlTeclado();
    this.storage.getItem('usuario')
      .then((usuario) => {
        if (usuario) {
          if (usuario.es_admin) {
            this.router.navigate(['/administrador']);
          } else {
            this.router.navigate(['/tabs/home']);
          }
        }
      })
      .catch(() => {
        console.log('No hay sesión activa');
      });

    this.bd.fetchUsuarios().subscribe((usuarios) => {
      this.listaUsuarios = usuarios;
    });

    this.bd.dbReady().subscribe((isReady) => {
      if (isReady) {
        this.bd.cargarUsuarios();
      }
    });
  }

  async iniciarSesion() {
    const nombre = this.miFormulario.get('nombre')?.value;
    const contrasenia = this.miFormulario.get('password')?.value;

    try {
      const loginExitoso = await this.bd.loginUsuario(nombre, contrasenia);

      if (loginExitoso) {
        const usuarioActual = this.bd.getUsuarioActual();

        if (usuarioActual?.id) {
          // Verificar si el usuario está baneado
          await this.bd.verificarUsuarioBaneado(usuarioActual.id);

          await this.storage.setItem('usuario', usuarioActual);

          if (usuarioActual.es_admin) {
            this.router.navigate(['/administrador']);
          } else {
            this.router.navigate(['tabs/home']);
          }
        } else {
          this.presentAlert('Error', 'No se pudo obtener el ID del usuario.');
        }
      } else {
        this.presentAlert('Error', 'Credenciales incorrectas.');
      }
    } catch (error) {
      if (error instanceof Error) {
        this.presentAlert('Acceso Denegado', error.message);
      } else {
        this.presentAlert('Error', 'Ocurrió un error desconocido.');
      }
    }
  }

  async cerrarSesion() {
    await this.storage.remove('usuario');
    this.router.navigate(['/login']);
  }

  async presentAlert(titulo: string, mensaje: string) {
    const toast = await this.toastController.create({
      header: titulo,
      message: mensaje,
      duration: 2000,
      position: 'top',
    });
    await toast.present();
  }

  onSubmit() {
    if (this.miFormulario.valid) {
      this.iniciarSesion();
    }
  }

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  camcont() {
    this.router.navigate(['/cambiarcontra']);
  }

  olvidoContra() {
    this.router.navigate(['/olvido-contrasenia']);
  }

  regses() {
    this.router.navigate(['/registro']);
  }

  iniciarControlTeclado() {
    Keyboard.addListener('keyboardWillShow', () => {
      document.body.classList.add('keyboard-is-open');
    });
    Keyboard.addListener('keyboardWillHide', () => {
      document.body.classList.remove('keyboard-is-open');
    });
  }

  initializeKeyboardListeners() {
    Keyboard.addListener('keyboardWillShow', (info) => {
      const keyboardHeight = info.keyboardHeight;
      document.body.style.paddingBottom = `${keyboardHeight}px`;
    });

    Keyboard.addListener('keyboardWillHide', () => {
      document.body.style.paddingBottom = '0px';
    });
  }
}
