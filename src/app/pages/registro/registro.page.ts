import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { EmailValidator, ReactiveFormsModule, AbstractControl } from '@angular/forms';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ToastController } from '@ionic/angular';

@Component({
  selector: 'app-registro',
  templateUrl: './registro.page.html',
  styleUrls: ['./registro.page.scss'],
})
export class RegistroPage implements OnInit {

  miFormulario: FormGroup;

  reg = {
    name: '',
    email: '',
    num: '',
    dir: ''
  };

  procesar(){
    console.log(this.reg);
  }

  password: string = '';
  showPassword: boolean = false;

  constructor(private router:Router, private toastController: ToastController, private fb: FormBuilder) { 
    this.miFormulario = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email, this.CorreoReal]],
      phone: ['',[Validators.required, this.NumeroReal]],
      password: ['', [Validators.required, Validators.minLength(6)]],
    })
   }

  ngOnInit() {
  }

  onSubmit() {
    console.log('Estado del formulario:', this.miFormulario);
    if (this.miFormulario.invalid) {
      console.log('Formulario inválido:', this.miFormulario.errors);
      return;
    }
  
    console.log('Formulario válido y enviado:', this.miFormulario.value);
    this.presentToast('bottom');
  }

  async presentToast(position: 'top' | 'middle' | 'bottom') {
    const toast = await this.toastController.create({
      message: 'Gracias por registrarte',
      duration: 1500,
      position: position,
    });

    await toast.present();
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

