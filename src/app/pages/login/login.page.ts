import { Component, OnInit } from '@angular/core';
import { Router, NavigationExtras } from '@angular/router';
import { AlertController, ToastController } from '@ionic/angular';
import { ReactiveFormsModule } from '@angular/forms';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Keyboard } from '@capacitor/keyboard';
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
    private storage: NativeStorage, private bd: ServicebdService) { 
    this.miFormulario = this.formBuilder.group({
      nombre: ['', [Validators.required, Validators.minLength(3)]],
      password: ['', [Validators.required, Validators.minLength(8)]]
    });
  }

  ionViewWillEnter() {
    this.miFormulario.reset();
  }

  async ngOnInit() {
   this.initializeKeyboardListeners();
   this.iniciarControlTeclado();
   this.storage.getItem('usuario').then((usuario) => {
    if (usuario) {
      if(usuario.es_admin){
        this.router.navigate(['/administrador']);
      } else {
        this.router.navigate(['/tabs/home']);
      }
    }
   }).catch(() => {
    console.log('No hay sesion activa');
   });

   this.bd.fetchUsuarios().subscribe(usuarios => {
    this.listaUsuarios = usuarios;
   }
  )
  
   this.bd.dbReady().subscribe(isReady => {
    if(isReady){
      this.bd.cargarUsuarios();
    }
   })
  }

  async iniciarSesion() {
    const nombre = this.miFormulario.get('nombre')?.value; 
    const contrasenia = this.miFormulario.get('password')?.value; 
    const loginExitoso = await this.bd.loginUsuario(nombre, contrasenia);
    
    if (loginExitoso) {
      const usuarioActual = this.bd.getUsuarioActual();
      console.log('Usuario después del login:', usuarioActual);
      if(usuarioActual){
        await this.storage.setItem('usuario', usuarioActual);
      }
      if (usuarioActual && usuarioActual.es_admin) {
        this.router.navigate(['/administrador']); 
      } else {
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
    this.router.navigate(['/registro']);
  }

  iniciarControlTeclado(){
    Keyboard.addListener('keyboardWillShow', () => {
      document.body.classList.add('keyboard-is-open');
    })
    Keyboard.addListener('keyboardWillHide', () => {
      document.body.classList.remove('keyboard-is-open')
    })
  }

  initializeKeyboardListeners() {
    Keyboard.addListener('keyboardWillShow', (info) => {
      const keyboardHeight = info.keyboardHeight; 
      document.body.style.paddingBottom = `${keyboardHeight}px`; 
    });

    Keyboard.addListener('keyboardWillHide', () => {
      document.body.style.paddingBottom = '0px'; 
    });
  }
}
