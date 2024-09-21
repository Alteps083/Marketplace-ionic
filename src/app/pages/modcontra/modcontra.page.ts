import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ToastController } from '@ionic/angular';
import { Form, FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-modcontra',
  templateUrl: './modcontra.page.html',
  styleUrls: ['./modcontra.page.scss'],
})
export class ModcontraPage implements OnInit {

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

  miFormulario: FormGroup

  constructor(private router:Router, private toastController: ToastController, private fb: FormBuilder) { 
    this.miFormulario = this.fb.group({
      oldPassword: ['', Validators.required],
      newPassword:['',[Validators.required], Validators.minLength(8)],
      confirmPassword: ['', Validators.required]
    }, {validator: this.passwordsMatch})
   }

   passwordsMatch(group: FormGroup){
    const newPassword = group.get('newPassword')?.value;
    const confirmPassword = group.get('confirmPassword')?.value;

    return newPassword === confirmPassword ? null: { notMatching: true}
   }

   onSubmit(){
    if(this.miFormulario.valid){
      console.log('Contraseña actualizada', this.miFormulario.value);
    }
   }

  ngOnInit() {
  }

  async presentToast(position: 'top' | 'middle' | 'bottom') {
    const toast = await this.toastController.create({
      message: 'Cambios realizados',
      duration: 1500,
      position: position,
    });

    await toast.present();
  }

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

home(){
    //crear logica de programación
    this.router.navigate(['/tabs/home']);
  }

}
