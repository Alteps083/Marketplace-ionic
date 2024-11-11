import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { EmailValidator, ReactiveFormsModule, AbstractControl, ValidationErrors } from '@angular/forms';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ToastController } from '@ionic/angular';
import { ServicebdService } from 'src/app/services/servicebd.service';
import { Usuario } from 'src/app/services/usuario';

@Component({
  selector: 'app-registro',
  templateUrl: './registro.page.html',
  styleUrls: ['./registro.page.scss'],
})
export class RegistroPage implements OnInit {

  miFormulario: FormGroup;

  password: string = '';
  showPassword: boolean = false;

  usuario: Usuario | null = null;

  constructor(private router:Router, private toastController: ToastController, private fb: FormBuilder, private serviceBd: ServicebdService) { 
    this.miFormulario = this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email, this.CorreoReal]],
      phone: ['', [Validators.required, this.NumeroReal]],
      password: ['', [Validators.required, Validators.minLength(6), this.ContraseñaRestrincciones]],
      confirmPassword: ['', [Validators.required]]
    }, { validator: this.passwordsMatch });
   }

  ngOnInit() {
  }

  ionViewWillEnter() {
    this.miFormulario.reset();
  }
  
  formatPhoneNumber() {
    let phoneInput = this.miFormulario.get('phone');
    if (phoneInput) {
        let value = phoneInput.value.replace(/\D/g, ''); 

        if (!value.startsWith('56')) {
            value = '56' + value; 
        } else {
            value = value.slice(2); 
        }

        if (value.length > 8) {
            value = value.replace(/(\d{2})(\d)(\d{4})(\d{4})/, '$1 $2 $3 $4'); 
        } else if (value.length === 8) {
            value = value.replace(/(\d{2})(\d{1})(\d{4})/, '$1 $2 $3'); 
        } else if (value.length === 7) {
            value = value.replace(/(\d{2})(\d{1})(\d{3})/, '$1 $2 $3'); 
        } else if (value.length === 6) {
            value = value.replace(/(\d{2})(\d{1})(\d{2})/, '$1 $2 $3'); 
        } else if (value.length === 5) {
            value = value.replace(/(\d{2})(\d{1})/, '$1 $2'); 
        }
        phoneInput.setValue(value.trim()); 
    }
  }

  onSubmit() {
    if (this.miFormulario.invalid) {
      console.log('Formulario inválido:', this.miFormulario.errors);
      return;
    }
  
    console.log('Formulario válido y enviado:', this.miFormulario.value);
  
    const nombre = this.miFormulario.value.nombre;
    const email = this.miFormulario.value.email;
    const telefono = this.miFormulario.value.phone.replace(/\s/g, '');;
    const contrasenia = this.miFormulario.value.password;

    const nuevoUsuario: Usuario = {
      nombre: nombre,
      email: email,
      contrasenia: contrasenia,
      telefono: telefono,
      fecha_registro: new Date().toISOString(), 
      es_admin: false,
      estado: 0
    };

    this.serviceBd.dbReady().subscribe(isReady => {
      if(isReady){
        this.serviceBd.registrarUsuario(nuevoUsuario).then((registroExistoso) => {
        if(registroExistoso){
          this.presentToast('bottom', 'Usuario registrado Correctamente, Inicie sesion');
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

  CorreoReal(control: AbstractControl) {
    if (!control.value) {
      return null; 
    }
    const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
    if (!emailPattern.test(control.value)) {
      return { invalidEmail: true };
    }
    const parts = control.value.split('@');
    if (parts.length !== 2) {
      return { invalidEmail: true };
    }
    const domainParts = parts[1].split('.'); 
    if (domainParts.length > 2) {
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

   passwordsMatch(control: AbstractControl): ValidationErrors | null {
    const password = control.get('password')?.value;
    const confirmPassword = control.get('confirmPassword')?.value;
    return password === confirmPassword ? null : { passwordsMismatch: true };
  }

  NumeroReal(control: AbstractControl) {
    const phoneNumber = control.value.replace(/\D/g, ''); 
    const phonePattern = /^569\d{8}$/; 
  
    if (control.value && !phonePattern.test(phoneNumber)) {
      return { invalidPhone: true }; 
    }
  
    if (phoneNumber.length !== 11) { 
      return { maxlength: true }; 
    }
  
    return null;
  }

  onPhoneInput(event: any) {
    const input = event.target.value;
    this.miFormulario.get('phone')?.setValue(input); 
    this.formatPhoneNumber();
}

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  iniciarses(){
    this.router.navigate(['/home']);
  }
  camcont(){
    this.router.navigate(['/cambiarcontra']);
  }
  regses(){
    this.router.navigate(['/registro']);
  }

  accountcreate(){
    this.router.navigate(['/login'])
  }

}

