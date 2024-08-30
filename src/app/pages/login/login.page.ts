import { Component, OnInit } from '@angular/core';
import { Router, NavigationExtras } from '@angular/router';
import { ToastController } from '@ionic/angular';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {

  user = {
    usuario: ''
  };

  procesar(){
    console.log(this.user);
  }
  
  password: string = '';
  showPassword: boolean = false;

  constructor(private router:Router, private toastController: ToastController) { }

  login() {
    const NavigationExtras: NavigationExtras = {
      state: {
        user: this.user
      }
    };
    this.router.navigate(['/home'], NavigationExtras);
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

  ngOnInit() {
  }

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  iniciarses(){
    //crear logica de programación
    this.router.navigate(['/tabs/home']);
  }
  camcont(){
    //crear logica de programación
    this.router.navigate(['/cambiarcontra']);
  }
  regses(){
    //crear logica de programación
    this.router.navigate(['/registro']);
  }
  homeadmin(){
    //crear logica de programación
    this.router.navigate(['/tabs/homeadmin']);
  }

}
