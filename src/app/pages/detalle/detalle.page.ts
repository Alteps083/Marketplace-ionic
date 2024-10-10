import { Component, OnInit } from '@angular/core';
import { Router, NavigationExtras } from '@angular/router';
import { ModalController } from '@ionic/angular';
import { ImageModalComponent } from '../../components/image-modal/image-modal.component'; // Ajusta la ruta según tu estructura de carpetas
import { Producto } from 'src/app/services/producto';
import { ActivatedRoute } from '@angular/router';
import { ServicebdService } from 'src/app/services/servicebd.service';

@Component({
  selector: 'app-detalle',
  templateUrl: './detalle.page.html',
  styleUrls: ['./detalle.page.scss'],
})
export class DetallePage implements OnInit {

  profileImage: string | null = null;

  producto : Producto | null = null;

  constructor(private router:Router, private modelController: ModalController, private activeRouter: ActivatedRoute, private bd: ServicebdService) { }

  async presentImageModal(imageSrc: string) {
    const modal = await this.modelController.create({
      component: ImageModalComponent,
      componentProps: {
        imageSrc: imageSrc,
      },
    });
    return await modal.present();
  }

  async ngOnInit() {
    const id = parseInt(this.activeRouter.snapshot.paramMap.get('id') || '0', 10); 
    this.cargarProducto(id);

    const usuarioActual = this.bd.getUsuarioActual();
    if (usuarioActual && usuarioActual.nombre) {
      this.profileImage = await this.bd.obtenerImagenUsuario(usuarioActual.nombre);
    }
  }

  async cargarProducto(id: number) {
    const productoCargado = await this.bd.fetchProductoPorId(id);
    if (productoCargado) {
      this.producto = productoCargado;
    } else {
      this.producto = {
        id: 0,
        id_vendedor: 1,
        nombre_producto: 'Producto no encontrado',
        descripcion: 'No se encontró ningún detalle para este producto.',
        categoria: 'Sin categoría',
        estado: 'Sin estado',
        precio: 0,
        imagenes: []
      }; 
    }
  }
  
  perfil() {
    this.router.navigate(['/tabs/perfil']);
  }

  vendedor(){
    this.router.navigate(['/tabs/chat'])
  }
}
