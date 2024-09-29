import { Component, OnInit } from '@angular/core';
import { Router, NavigationExtras } from '@angular/router';
import { AlertController, ToastController } from '@ionic/angular';
import { ReactiveFormsModule } from '@angular/forms';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NativeStorage } from '@awesome-cordova-plugins/native-storage/ngx';


@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {
  miFormulario: FormGroup;

  usuario: string = '';
  valor: string = '';

  password: string = '';
  showPassword: boolean = false;

  constructor(private router:Router, private toastController: ToastController, private formBuilder: FormBuilder, 
    private storage: NativeStorage, private alertController: AlertController) { 
    this.miFormulario = this.formBuilder.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      password: ['', [Validators.required, Validators.minLength(8)]]
    });
  }

  ngOnInit() {
   
  }

  async login() {
    if (this.miFormulario.valid) {
      const usuario = this.miFormulario.get('name')?.value;
      const password = this.miFormulario.get('password')?.value;

      try {
        await this.storage.setItem('user', { name: usuario, password: password });
        console.log('Usuario guardado exitosamente');

        this.router.navigate(['/tabs/home']);

        const toast = await this.toastController.create({
          message: 'Inicio de sesión exitoso.',
          duration: 2000,
          color: 'success',
        });
        toast.present();
      } catch (error) {
        console.error('Error al guardar los datos del usuario', error);
      }
    } else {
      const alert = await this.alertController.create({
        header: 'Error',
        message: 'Por favor, completa el formulario correctamente.',
        buttons: ['OK'],
      });
      await alert.present();
    }
  }

  

  loginad() {
    this.router.navigate(['/tabs/homeadmin']);
  }


  onSubmit(){
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
