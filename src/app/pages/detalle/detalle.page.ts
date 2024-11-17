import { Component, OnInit } from '@angular/core';
import { Router, NavigationExtras } from '@angular/router';
import { ModalController } from '@ionic/angular';
import { ImageModalComponent } from '../../components/image-modal/image-modal.component'; // Ajusta la ruta según tu estructura de carpetas
import { Producto } from 'src/app/services/producto';
import { ActivatedRoute } from '@angular/router';
import { ServicebdService } from 'src/app/services/servicebd.service';
import { Usuario } from 'src/app/services/usuario';
import { RatingService } from 'src/app/services/rating.service';
import { NativeStorage } from '@awesome-cordova-plugins/native-storage/ngx';
@Component({
  selector: 'app-detalle',
  templateUrl: './detalle.page.html',
  styleUrls: ['./detalle.page.scss'],
})
export class DetallePage implements OnInit {

  usuario: Usuario | null = null;
  ratings: any[] = [];
  userRating = {
    score: 0,
    review: ''
  };

  currentImageIndex: number = 0;

  profileImage: string | null = null;

  producto : Producto | null = null;

  comentarios: any[] = [];
  nuevoComentario: string = '';

  constructor(private router:Router, private modelController: ModalController, private activeRouter: ActivatedRoute, private bd: ServicebdService, private ratingService: RatingService, private storage: NativeStorage) { 
   }

   ionViewWillEnter() {
  }

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
    this.currentImageIndex = 0;
    this.usuario = this.bd.getUsuarioActual();
    if (this.usuario?.id !== undefined) {
      this.profileImage = await this.bd.obtenerImagenUsuario(this.usuario.id);
    } else {
      console.error('El ID del usuario no está definido.');
      this.profileImage = 'ruta/a/nouser.png'; 
    }
    await this.cargarUsuario();
    const id = parseInt(this.activeRouter.snapshot.paramMap.get('id') || '0', 10); 
    await this.cargarProducto(id);
    this.cargarComentarios();  
  }

  async cargarUsuario() {
    try {
      const data = await this.storage.getItem('usuario_actual');
      if (data) {
        this.usuario = data;
        this.storage.getItem('usuario_actual').then(async (data: Usuario) => {
          if (data) {
            this.usuario = data;
            try {
              this.profileImage = await this.bd.obtenerImagenUsuario(this.usuario?.id || 0); 
            } catch (error) {
              console.log('Error al cargar la imagen de perfil:', error);
            }
          }
        }).catch(error => {
          console.log('Error al recuperar usuario: ', JSON.stringify(error));
        });
        if (this.usuario?.id) {
          this.profileImage = await this.bd.obtenerImagenUsuario(this.usuario.id); 
          console.log('Imagen de perfil cargada para:', this.usuario.nombre);
        }
      }
    } catch (error) {
      console.log('Error al cargar usuario:', error);
    }
  } 

  async cargarProducto(id: number) {
    const productoCargado = await this.bd.fetchProductoPorId(id);
    if (productoCargado) {
      this.producto = productoCargado;
      await this.loadRatingsByProductId(this.producto.id);
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

  
  previousImage() {
    if (this.producto?.imagenes && this.currentImageIndex > 0) {
      this.currentImageIndex--;
    }
  }

  nextImage() {
    if (this.producto?.imagenes && this.currentImageIndex < this.producto.imagenes.length - 1) {
      this.currentImageIndex++;
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

  fetchRatings() {
    this.ratingService.getRatings().subscribe(data => {
      this.ratings = data;
    });
  }

  loadRatings() {
    this.ratingService.getRatings().subscribe(
      (data) => {
        console.log('Calificaciones obtenidas:', data); 
        this.ratings = data; 
      },
      (error) => {
        console.error('Error al obtener calificaciones:', error);
      }
    );
  }

  loadRatingsByProductId(productId: number) {
    this.ratingService.getRatingsByProductId(productId).subscribe(
      (data) => {
        console.log('Calificaciones obtenidas para el producto:', data); 
        this.ratings = data; 
      },
      (error) => {
        console.error('Error al obtener calificaciones:', error);
      }
    );
  }

  submitRating() {
    const ratingToSend = {
      productId: this.producto!.id,
      score: Number(this.userRating.score), 
      review: this.userRating.review
    };
  
    console.log('Intentando enviar calificación:', JSON.stringify(ratingToSend));
    
    this.ratingService.postRating(ratingToSend).subscribe(
      response => {
        console.log('Calificación enviada con éxito:', JSON.stringify(response));
      },
      error => {
        console.error('Error al enviar la calificación:', JSON.stringify(error));
      }
    );
  }

}
