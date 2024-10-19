import { Component, OnInit } from '@angular/core';
import { Router, NavigationExtras } from '@angular/router';
import { ModalController } from '@ionic/angular';
import { ImageModalComponent } from '../../components/image-modal/image-modal.component'; // Ajusta la ruta según tu estructura de carpetas
import { Producto } from 'src/app/services/producto';
import { ActivatedRoute } from '@angular/router';
import { ServicebdService } from 'src/app/services/servicebd.service';
import { Usuario } from 'src/app/services/usuario';
@Component({
  selector: 'app-detalle',
  templateUrl: './detalle.page.html',
  styleUrls: ['./detalle.page.scss'],
})
export class DetallePage implements OnInit {

  profileImage: string | null = null;

  producto : Producto | null = null;

  comentarios: any[] = [];
  nuevoComentario: string = '';

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
    this.cargarComentarios();  
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

  async cargarComentarios() {
    if (this.producto) { 
      this.comentarios = await this.bd.obtenerComentarios(this.producto.id);
    } else {
      console.error('No se puede cargar comentarios, el producto es null');
    }
  }

  async publicarComentario() {
    const usuarioActual = await this.bd.getUsuarioActual();
    const usuarioId = usuarioActual ? usuarioActual.id : undefined;
  
    if (!this.producto || usuarioId === undefined) {
      console.error('No se puede publicar el comentario, el producto o el usuario no están disponibles.');
      return; 
    }
    await this.bd.agregarComentario(this.producto.id, usuarioId, this.nuevoComentario);
    this.nuevoComentario = ''; 
    this.cargarComentarios(); 
  }
  
  perfil() {
    this.router.navigate(['/tabs/perfil']);
  }

}
