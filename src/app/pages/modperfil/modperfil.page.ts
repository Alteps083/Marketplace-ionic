import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { EmailValidator, ReactiveFormsModule, AbstractControl } from '@angular/forms';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ToastController } from '@ionic/angular';
import { ServicebdService } from 'src/app/services/servicebd.service';
import { Usuario } from 'src/app/services/usuario';

@Component({
  selector: 'app-modperfil',
  templateUrl: './modperfil.page.html',
  styleUrls: ['./modperfil.page.scss'],
})
export class ModperfilPage implements OnInit {

  miFormulario: FormGroup;

  usuario: Usuario | null = null;

  password: string = '';
  showPassword: boolean = false;

  handleRefresh(event: CustomEvent) {
    setTimeout(() => {
      const refresher = event.target as HTMLIonRefresherElement;
      if (refresher) {
        refresher.complete(); // Completa el refresco
      }
    }, 2000); // Simula una carga de 2 segundos
  }

  constructor(private router:Router, private toastController: ToastController, private fb: FormBuilder, private bd: ServicebdService) {
    this.miFormulario = this.fb.group({
      name: ['', [Validators.minLength(3)]],
      email: ['', [Validators.email, this.CorreoReal]],
      phone: ['',[this.NumeroReal]],
    })
   }

  ngOnInit() {
    this.usuario = this.bd.getUsuarioActual();
    if (this.usuario){
      this.miFormulario.patchValue({
        name: this.usuario.nombre,
        email: this.usuario.email,
        phone: this.usuario.telefono
      })
    }
  }

  async onSubmit(){
    if(this.miFormulario.valid){
      const actualizarUsuario: Usuario = {
        ...this.usuario,
        ...this.miFormulario.value,
      }
      await this.bd.actualizarUsuario(actualizarUsuario);
      this.router.navigate(['/perfil'])
    }
    console.log('Formulario enviado', this.miFormulario.value);
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

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  async presentToast(position: 'top' | 'middle' | 'bottom') {
    const toast = await this.toastController.create({
      message: 'Cambios guardados',
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

}
