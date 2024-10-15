import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { EmailValidator, ReactiveFormsModule, AbstractControl, ValidationErrors } from '@angular/forms';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ToastController } from '@ionic/angular';
import { ServicebdService } from 'src/app/services/servicebd.service';
@Component({
  selector: 'app-registro',
  templateUrl: './registro.page.html',
  styleUrls: ['./registro.page.scss'],
})
export class RegistroPage implements OnInit {

  miFormulario: FormGroup;

  password: string = '';
  showPassword: boolean = false;

  constructor(private router:Router, private toastController: ToastController, private fb: FormBuilder, private serviceBd: ServicebdService) { 
    this.miFormulario = this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email, this.CorreoReal]],
      phone: ['',[Validators.required, this.NumeroReal, Validators.maxLength(11)]],
      password: ['', [Validators.required, Validators.minLength(6), this.ContraseñaRestrincciones]],
    })
   }

  ngOnInit() {
  }

  onSubmit() {
    if (this.miFormulario.invalid) {
      console.log('Formulario inválido:', this.miFormulario.errors);
      return;
    }
  
    console.log('Formulario válido y enviado:', this.miFormulario.value);
  
    const nombre = this.miFormulario.value.nombre;
    const email = this.miFormulario.value.email;
    const telefono = this.miFormulario.value.phone;
    const contrasenia = this.miFormulario.value.password;

    this.serviceBd.dbReady().subscribe(isReady => {
      if(isReady){
        this.serviceBd.registrarUsuario(nombre,email,contrasenia,telefono).then((registroExistoso) => {
        if(registroExistoso){
          this.router.navigate(['/login']);
        }else{
          console.log('El correo ya existe :v');
        }
        }).catch(e => {
          console.log('Error al registrar usuario: ', JSON.stringify(e));
          this.presentToast('bottom', 'Error al registrar usuario.');
        })
      }else{
        this.presentToast('bottom', 'La Base de Datos aun no esta lista >:c');
      }
    })
  }

  async presentToast(position: 'top' | 'middle' | 'bottom', message: string) {
    const toast = await this.toastController.create({
      message: message,
      duration: 1500,
      position: position,
    });

    await toast.present();
  }

  CorreoReal(control: AbstractControl){
    const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
    if (control.value && !emailPattern.test(control.value)){
      return {invalidEmail: true};
    }

    const domainParts = control.value.split('.');
    if (domainParts.length > 2 && domainParts[domainParts.length - 2].length > 2) {
      return { invalidEmail: true };  
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

  iniciarses(){
    //crear logica de programación
    this.router.navigate(['/home']);
  }
  camcont(){
    //crear logica de programación
    this.router.navigate(['/cambiarcontra']);
  }
  regses(){
    //crear logica de programación
    this.router.navigate(['/registro']);
  }
  accountcreate(){
    this.router.navigate(['/login'])
  }

}

