import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';
import { ToastController } from '@ionic/angular';
import { LocalNotifications } from '@capacitor/local-notifications';
import { ServicebdService } from 'src/app/services/servicebd.service';
import { Usuario } from 'src/app/services/usuario';
import { NativeStorage } from '@awesome-cordova-plugins/native-storage/ngx';
import { Camera, CameraResultType } from '@capacitor/camera';

@Component({
  selector: 'app-modperfil',
  templateUrl: './modperfil.page.html',
  styleUrls: ['./modperfil.page.scss'],
})
export class ModperfilPage implements OnInit {

  imagenper: any;
  profileImage: string | null = null;

  miFormulario: FormGroup;
  miFormularioContrasenia: FormGroup;
  usuario: Usuario | null = null;
  password: string = '';
  showPassword: boolean = false;

  currentStep: number = 1; // Cambiar de paso según el flujo

  phoneForm: FormGroup;
  tokenForm: FormGroup;
  verificationToken: string | null = null;
  showTokenInput = false;

  constructor(private router: Router, private toastController: ToastController, private fb: FormBuilder, private bd: ServicebdService, private storage: NativeStorage) {
    this.miFormulario = this.fb.group({
      name: ['', [Validators.minLength(3)]],
      email: ['', [Validators.email, this.CorreoReal]],
      phone: ['', [this.NumeroReal, Validators.pattern(/^\+56 9\d{8}$/)]],
      password: ['', [Validators.minLength(6)]],
    });
    
    this.miFormularioContrasenia = this.fb.group({
      currentPassword: ['', [Validators.required]], 
      password: ['', [Validators.minLength(6), this.ContraseñaRestrincciones]],
      confirmPassword: ['', [Validators.minLength(6)]],
    });

    this.phoneForm = this.fb.group({
      phone: ['', [this.NumeroReal, Validators.pattern(/^56\d{9}$/)]],

    });
    
    this.tokenForm = this.fb.group({
      token: ['', [Validators.required, Validators.minLength(4), Validators.maxLength(4)]],
    });
  }

  handleRefresh(event: CustomEvent) {
    setTimeout(() => {
      const refresher = event.target as HTMLIonRefresherElement;
      if (refresher) {
        refresher.complete(); 
      }
    }, 2000); 
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

  async sendToken() {
    if (this.phoneForm.valid) {
      this.verificationToken = (Math.floor(1000 + Math.random() * 9000)).toString();
      await LocalNotifications.schedule({
        notifications: [{
          id: 1,
          title: "Token de verificación",
          body: `Tu token es: ${this.verificationToken}`,
        }]
      });
      await this.storage.setItem('verificationToken', this.verificationToken);
      this.showTokenInput = true;
      this.currentStep = 2; // Cambiar al formulario de token
    }
  }

  async verifyToken() {
    const storedToken = await this.storage.getItem('verificationToken');
    if (this.tokenForm.value.token === storedToken) {
      await this.storage.remove('verificationToken');
      this.currentStep = 3; // Cambiar al formulario de cambio de contraseña
      this.presentToast('bottom', 'Token verificado exitosamente');
    } else {
      this.presentToast('middle', 'El token es incorrecto');
    }
  }

  cargarUsuario() {
    this.storage.getItem('usuario').then((data: Usuario) => {
      if(data) {
        this.usuario = data;
        this.miFormulario.patchValue({
          name: this.usuario.nombre,
          email: this.usuario.email,
          phone: this.usuario.telefono
        });
        this.imagenper = this.usuario.imagen;
      }
    }).catch(error => {
      console.log('Error al recuperar usuario: ', JSON.stringify(error));
    });
  }

  async onSubmit() {
    if (this.miFormulario.valid) {
      const actualizarUsuario: Partial<Usuario> = {  
        nombre: this.miFormulario.value.name || this.usuario?.nombre,
        contrasenia: this.miFormulario.value.password || this.usuario?.contrasenia,
        email: this.miFormulario.value.email || this.usuario?.email,
        telefono: this.miFormulario.value.phone || this.usuario?.telefono,
        imagen: this.imagenper || this.usuario?.imagen
      };
      try {
        if (this.usuario?.id) {
          await this.bd.actualizarUsuario({...this.usuario, ...actualizarUsuario}); 
        }

        await this.storage.setItem('usuario', {...this.usuario, ...actualizarUsuario});
  
        await this.presentToast('bottom');

        this.router.navigate(['tabs/perfil']);
      } catch (error) {
        console.error('Error al actualizar usuario: ', error);
        this.presentToast('top');
      }
    }
  }

  async onChangePassword() {
    if (this.miFormularioContrasenia.valid) {
      if (this.miFormularioContrasenia.value.password !== this.miFormularioContrasenia.value.confirmPassword) {
        this.presentToast('middle', 'Las contraseñas no coinciden');
        return;
      }

      if (this.usuario) {
        if (this.usuario.contrasenia !== this.miFormularioContrasenia.value.currentPassword) {
          this.presentToast('middle', 'La contraseña actual es incorrecta');
          return;
        }

        this.usuario.contrasenia = this.miFormularioContrasenia.value.password;

        try {
          await this.bd.actualizarUsuario(this.usuario);
          await this.storage.setItem('usuario', this.usuario);
          this.presentToast('bottom', 'Contraseña actualizada exitosamente');
          this.storage.clear();
          this.router.navigate(['/login']);
        } catch (error) {
          console.error('Error al actualizar la contraseña: ', error);
          this.presentToast('top', 'Error al actualizar la contraseña');
        }
      } else {
        this.presentToast('middle', 'No se encontró el usuario');
      }
    }
  }

  CorreoReal(control: AbstractControl) {
    const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (control.value && !emailPattern.test(control.value)){
      return {invalidEmail: true};
    }
    return null;
  }

  NumeroReal(control: AbstractControl) {
    const phonePattern = /^[0-9]+$/;
    if(control.value && !phonePattern.test(control.value)){
      return {invalidPhone: true};
    }
    return null;
  }

  ContraseñaRestrincciones(control: AbstractControl) {
    const contra: string = control.value || '';
    const hasUpperCase = /[A-Z]/.test(contra);
    const hasLowerCase = /[a-z]/.test(contra);
    const hasNumber = /\d/.test(contra);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(contra);
    const valid = hasUpperCase && hasLowerCase && hasNumber && hasSpecialChar;
    if(!valid){
      return { RangoContrasenia: true }
    }
    return null;
  }

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  async presentToast(position: 'top' | 'middle' | 'bottom', message: string = 'Cambios guardados') {
    const toast = await this.toastController.create({
      message: message,
      duration: 1500,
      position: position,
    });
    await toast.present();
  }

  home() {
    this.router.navigate(['/tabs/home']);
  }

  perfil() {
    this.router.navigate(['/tabs/perfil']);
  }

  takePicture = async () => {
    const image = await Camera.getPhoto({
      quality: 90,
      allowEditing: false,
      resultType: CameraResultType.Uri
    });
  
    if (image.webPath) {
      this.imagenper = image.webPath;
      this.profileImage = image.webPath;
    
      if (this.usuario && this.usuario.nombre) {
        this.usuario.imagen = this.imagenper; 
        await this.bd.actualizarUsuario(this.usuario);
        await this.storage.setItem('usuario', this.usuario);
        this.presentToast('top');
      }
    }
  };
}
