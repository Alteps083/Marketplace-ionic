import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators , ReactiveFormsModule  } from '@angular/forms';
import { Router } from '@angular/router';
import { LocalNotifications } from '@capacitor/local-notifications';
import { ServicebdService } from 'src/app/services/servicebd.service';

@Component({
  selector: 'app-olvido-contrasenia',
  templateUrl: './olvido-contrasenia.page.html',
  styleUrls: ['./olvido-contrasenia.page.scss'],
})
export class OlvidoContraseniaPage implements OnInit {

  recuperContra: FormGroup;

  constructor(private fb: FormBuilder, private router: Router, private bd: ServicebdService) { 
    this.recuperContra = this.fb.group({
      telefono: ['', [Validators.required, Validators.pattern(/^569\d{8}$/)]]
    })
  }

  ngOnInit() {
  }

  async enviarToken() {
    if (this.recuperContra.valid) {
      const telefonoIngresado = this.recuperContra.value.telefono;
  
      try {
        const usuario = await this.bd.obtenerUsuarioPorTelefono(telefonoIngresado);
  
        if (usuario) {
          const token = Math.floor(100000 + Math.random() * 900000).toString();

          await LocalNotifications.schedule({
            notifications: [
              {
                id: 1,
                title: 'Código de Recuperación',
                body: `Tu código es: ${token}`,
                schedule: { at: new Date(new Date().getTime() + 1000) },
              },
            ],
          });
          
          localStorage.setItem('recoveryToken', token);
          localStorage.setItem('telefonoRecuperacion', telefonoIngresado);
          alert('Token enviado. Redirigiendo...');
          this.router.navigate(['/reset-password']);
        } else {
          alert('El teléfono no está asociado a una cuenta.');
        }
      } catch (error) {
        console.error('Error al buscar el usuario por teléfono:', error);
        alert('Hubo un problema al validar el teléfono.');
      }
    } else {
      alert('Por favor ingresa un número de teléfono válido.');
    }
  }

}
