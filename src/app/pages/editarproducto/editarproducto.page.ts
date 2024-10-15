import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AlertController } from '@ionic/angular';
import { ServicebdService } from 'src/app/services/servicebd.service';
import { Producto } from 'src/app/services/producto';

interface NavigationExtras {
  state?: {
    producto: Producto;
  };
}

@Component({
  selector: 'app-editarproducto',
  templateUrl: './editarproducto.page.html',
  styleUrls: ['./editarproducto.page.scss'],
})
export class EditarproductoPage {
  producto!: Producto; // Usamos '!' para indicar que no es undefined al ser inicializado.

  constructor(
    private router: Router,
    private bd: ServicebdService,
    private alertController: AlertController
  ) {
    const navigation = this.router.getCurrentNavigation() as NavigationExtras;
    if (navigation?.state?.['producto']) {
      this.producto = navigation.state['producto']; // Asigna solo si no es undefined
    } else {
      this.presentAlert('Error', 'No se encontró el producto.');
      this.router.navigate(['/administrador']); // Regresar a la página del administrador si no hay producto
    }
  }

  async guardarCambios() {
    try {
      await this.bd.actualizarProducto(this.producto); // Implementa este método en tu servicio
      this.presentAlert('Éxito', 'Producto actualizado correctamente.');
      this.router.navigate(['/administrador']); // Regresar a la página del administrador
    } catch (e) {
      this.presentAlert('Error', 'No se pudo actualizar el producto.');
    }
  }

  async presentAlert(header: string, message: string) {
    const alert = await this.alertController.create({
      header,
      message,
      buttons: ['OK']
    });

    await alert.present();
  }
}
