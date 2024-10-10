import { Component, OnInit } from '@angular/core';
import { Router, NavigationExtras } from '@angular/router';
import { AlertController, ToastController } from '@ionic/angular';
import { ReactiveFormsModule } from '@angular/forms';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NativeStorage } from '@awesome-cordova-plugins/native-storage/ngx';
import { ServicebdService } from 'src/app/services/servicebd.service';
import { Usuario } from 'src/app/services/usuario';
import { isRTL } from 'ionicons/dist/types/components/icon/utils';


@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {
  miFormulario: FormGroup;

  usuario: string = '';
  valor: string = '';

  listaUsuarios: Usuario[] = [];

  password: string = '';
  showPassword: boolean = false;

  constructor(private router:Router, private toastController: ToastController, private formBuilder: FormBuilder, 
    private storage: NativeStorage, private servicebd: ServicebdService) { 
    this.miFormulario = this.formBuilder.group({
      nombre: ['', [Validators.required, Validators.minLength(3)]],
      password: ['', [Validators.required, Validators.minLength(8)]]
    });
  }

  ngOnInit() {
   this.storage.getItem('usuario').then((usuario) => {
    if (usuario) {
      if(usuario.es_admin){
        this.router.navigate(['tabs/home']);
      } else {
        this.router.navigate(['tabs/home']);
      }
    }
   }).catch(() => {
    console.log('No hay sesion activa');
   });

   this.servicebd.fetchUsuarios().subscribe(usuarios => {
    this.listaUsuarios = usuarios;
   }
  )
  
   this.servicebd.dbReady().subscribe(isReady => {
    if(isReady){
      this.servicebd.cargarUsuarios();
    }
   })
  }

  async iniciarSesion() {
    const nombre = this.miFormulario.get('nombre')?.value; 
    const contrasenia = this.miFormulario.get('password')?.value; 
    const loginExitoso = await this.servicebd.loginUsuario(nombre, contrasenia);
    
    if (loginExitoso) {
      const usuarioActual = this.servicebd.getUsuarioActual();
      console.log('Usuario después del login:', usuarioActual);
      if(usuarioActual){
        await this.storage.setItem('usuario', usuarioActual);
      }
      if (usuarioActual && usuarioActual.es_admin) {
        this.presentAlert('Éxito', 'Bienvenido Administrador');
        this.router.navigate(['tabs/home']); 
      } else {
        this.presentAlert('Éxito', 'Bienvenido Usuario');
        this.router.navigate(['tabs/home']); 
      }
    } else {
      this.presentAlert('Error', 'Credenciales incorrectas');
    }
  }

  async cerrarSesion(){
    await this.storage.remove('usuario');
    this.router.navigate(['/login']);
  }
  
  async presentAlert(titulo: string, mensaje: string) {
    const toast = await this.toastController.create({
      header: titulo,
      message: mensaje,
      duration: 2000,
      position: 'top',
    });
    await toast.present();
  }

  onSubmit(){
    if(this.miFormulario.valid){
      this.iniciarSesion();
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
