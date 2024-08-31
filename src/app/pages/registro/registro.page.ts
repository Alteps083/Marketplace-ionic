import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ToastController } from '@ionic/angular';

@Component({
  selector: 'app-registro',
  templateUrl: './registro.page.html',
  styleUrls: ['./registro.page.scss'],
})
export class RegistroPage implements OnInit {

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

  constructor(private router:Router, private toastController: ToastController) { }

  ngOnInit() {
  }

  async presentToast(position: 'top' | 'middle' | 'bottom') {
    const toast = await this.toastController.create({
      message: 'Gracias por registrarte',
      duration: 1500,
      position: position,
    });

    await toast.present();
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

