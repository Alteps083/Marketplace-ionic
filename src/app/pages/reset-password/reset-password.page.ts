import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';
import { Router } from '@angular/router';
import { ServicebdService } from 'src/app/services/servicebd.service';

@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.page.html',
  styleUrls: ['./reset-password.page.scss'],
})
export class ResetPasswordPage implements OnInit {

  resetContra: FormGroup;

  showPassword: boolean = false;

  constructor(private fb: FormBuilder, private bd: ServicebdService, private router: Router) {
    this.resetContra = this.fb.group(
      {
        codigo: ['', [Validators.required]],
        nuevaPassword: ['',[Validators.required,Validators.minLength(8),this.ContraseñaRestrincciones],],
        confirmarPassword: ['', [Validators.required]]},{ validator: this.passwordsCoinciden }
    );
  }

  ngOnInit() {
  }

  passwordsCoinciden(group: FormGroup) {
    const nuevaPassword = group.get('nuevaPassword')?.value;
    const confirmarPassword = group.get('confirmarPassword')?.value;
    return nuevaPassword === confirmarPassword ? null : { noCoinciden: true };
  }

  async cambiarPassword() {
    if (this.resetContra.valid) {
      const codigoIngresado = this.resetContra.value.codigo;
      const nuevaPassword = this.resetContra.value.nuevaPassword;
      const confirmarPassword = this.resetContra.value.confirmarPassword;
  
      console.log('Datos ingresados:', { codigoIngresado, nuevaPassword, confirmarPassword });
  
      if (nuevaPassword !== confirmarPassword) {
        alert('Las contraseñas no coinciden');
        return;
      }
  
      const tokenAlmacenado = localStorage.getItem('recoveryToken');
      console.log('Token almacenado:', tokenAlmacenado);
  
      if (codigoIngresado === tokenAlmacenado) {
        try {
          const telefonoUsuario = localStorage.getItem('telefonoRecuperacion');
          console.log('Teléfono de recuperación:', telefonoUsuario);
  
          if (!telefonoUsuario) {
            alert('No se encontró el teléfono de recuperación. Intente de nuevo.');
            return;
          }

          const usuario = await this.bd.obtenerUsuarioPorTelefono(telefonoUsuario);
          console.log('Usuario obtenido por teléfono:', usuario);
  
          if (!usuario) {
            alert('Usuario no encontrado con el teléfono proporcionado.');
            return;
          }

          usuario.contrasenia = nuevaPassword;
          console.log('Actualizando contraseña del usuario:', usuario);
  
          await this.bd.actualizarUsuario(usuario);

          localStorage.removeItem('recoveryToken');
          localStorage.removeItem('telefonoRecuperacion');
  
          alert('Contraseña cambiada con éxito');
          this.router.navigate(['/login']);
        } catch (error) {
          console.error('Error al actualizar la contraseña:', error);
          alert('Hubo un problema al actualizar la contraseña');
        }
      } else {
        alert('Código incorrecto');
      }
    } else {
      alert('Por favor completa todos los campos correctamente');
    }
  }

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
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
  
}
