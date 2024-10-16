import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { EmailValidator, ReactiveFormsModule, AbstractControl } from '@angular/forms';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ToastController } from '@ionic/angular';
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

  miFormulario: FormGroup;
  miFormularioContrasenia: FormGroup;
  usuario: Usuario | null = null;
  password: string = '';
  showPassword: boolean = false;

  handleRefresh(event: CustomEvent) {
    setTimeout(() => {
      const refresher = event.target as HTMLIonRefresherElement;
      if (refresher) {
        refresher.complete(); 
      }
    }, 2000); 
  }

 

  constructor(private router:Router, private toastController: ToastController, private fb: FormBuilder, private bd: ServicebdService, private storage: NativeStorage) {
    this.miFormulario = this.fb.group({
      name: ['', [Validators.minLength(3)]],
      email: ['', [Validators.email, this.CorreoReal]],
      phone: ['', [this.NumeroReal]],
      password: ['', [Validators.minLength(6)]],
    });
    this.miFormularioContrasenia = this.fb.group({
      currentPassword: ['', [Validators.required]], 
      password: ['', [Validators.minLength(6), this.ContraseñaRestrincciones]],
      confirmPassword: ['', [Validators.minLength(6)]],
    });
   }

  ngOnInit() {
    this.cargarUsuario();
  }

  cargarUsuario(){
    this.storage.getItem('usuario').then((data: Usuario) => {
      if(data) {
        this.usuario = data;
        this.miFormulario.patchValue({
          name: this.usuario.nombre,
          email: this.usuario.email,
          phone: this.usuario.telefono
        })
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
        } catch (error) {
          console.error('Error al actualizar la contraseña: ', error);
          this.presentToast('top', 'Error al actualizar la contraseña');
        }
      } else {
        this.presentToast('middle', 'No se encontró el usuario');
      }
    }
  }
  
  CorreoReal(control: AbstractControl){
    const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (control.value && !emailPattern.test(control.value)){
      return {invalidEmail: true};
    }
    return null;
  }

  NumeroReal(control: AbstractControl){
    const phonePattern = /^[0-9]+$/;
    if(control.value && !phonePattern.test(control.value)){
      return {invalidPhone: true};
    }
    return null;
  }

  ContraseñaRestrincciones(control: AbstractControl){
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

home(){
    //crear logica de programación
    this.router.navigate(['/tabs/home']);
  }

  perfil(){
    //crear logica de programación
    this.router.navigate(['/tabs/perfil']);
  }

  takePicture = async () => {
    const image = await Camera.getPhoto({
      quality: 90,
      allowEditing: false,
      resultType: CameraResultType.Uri
    });

    this.imagenper = image.webPath;
  
    if (this.usuario && this.usuario.nombre) {
      this.usuario.imagen = this.imagenper;
      await this.bd.actualizarUsuario(this.usuario);
      await this.storage.setItem('usuario', this.usuario);
      this.presentToast('top');
    }
};

}
