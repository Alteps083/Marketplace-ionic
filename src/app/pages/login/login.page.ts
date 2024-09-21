import { Component, OnInit } from '@angular/core';
import { Router, NavigationExtras } from '@angular/router';
import { ToastController } from '@ionic/angular';
import { ReactiveFormsModule } from '@angular/forms';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {
  miFormulario: FormGroup;
  user = {
    usuario: ''
  };

  procesar(){
    console.log(this.user);
  }

  password: string = '';
  showPassword: boolean = false;

  constructor(private router:Router, private toastController: ToastController, private formBuilder: FormBuilder) { 
    this.miFormulario = this.formBuilder.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      password: ['', [Validators.required, Validators.minLength(8)]]
    });
  }

  ngOnInit() {
   
  }

  login() {
    const NavigationExtras: NavigationExtras = {
      state: {
        user: this.user
      }
    };
    this.router.navigate(['/tabs/home'], NavigationExtras);
  }

  loginad() {
    const NavigationExtras: NavigationExtras = {
      state: {
        user: this.user
      }
    };
    this.router.navigate(['/tabs/homeadmin'], NavigationExtras);
  }

  async presentToast(position: 'top' | 'middle' | 'bottom') {
    const toast = await this.toastController.create({
      message: `Bienvenido, ${this.user.usuario}`,
      duration: 1500,
      position: position,
    });

    await toast.present();
  }
  async presentToastad(position: 'top' | 'middle' | 'bottom') {
    const toast = await this.toastController.create({
      message: `Bienvenido Admin, ${this.user.usuario}`,
      duration: 1500,
      position: position,
    });

    await toast.present();
  }

  onSubmit(){
    if (this.miFormulario.valid){
      console.log('Form data: ', this.miFormulario.value);
    } else {
      console.log('Form is invalid');
    }
  }

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }
  camcont(){
    this.router.navigate(['/cambiarcontra']);
  }
  regses(){
    //crear logica de programación
    this.router.navigate(['/registro']);
  }

}
