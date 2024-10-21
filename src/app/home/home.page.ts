import { Component, ElementRef, ViewChild, OnInit, OnDestroy  } from '@angular/core';
import Swiper from 'swiper';
import { Router, NavigationExtras } from '@angular/router';
import { ServicebdService } from '../services/servicebd.service';
import { Producto } from '../services/producto';
import { AlertController, Platform } from '@ionic/angular';
import { NativeStorage } from '@awesome-cordova-plugins/native-storage/ngx';
import { Usuario } from '../services/usuario';
@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage implements OnInit{

  profileImage: string = 'assets/img/nouser.png';

  productosRecientes: Producto[] = []; 
  productosPorCategoria: { [key: string]: Producto[] } = {}; 

  currentIndex = 0;
  
  usuario: Usuario | null = null;

  productos: Producto[] = [];

  productosFiltrados: Producto[] = [];
  mostrarBarraBusqueda: boolean = false;
  searchTerm: string = '';

  idsUsuarios: number[] = [];

//modificado
async ngOnInit() {
  // Cargar el usuario actual
  this.usuario = this.bd.getUsuarioActual();

  // Inicializar la imagen de perfil con la imagen predeterminada
  this.profileImage = '/assets/img/nouser.png'; // Imagen predeterminada

  // Intentar obtener la imagen del usuario
  if (this.usuario && this.usuario.nombre) {
    try {
      this.profileImage = await this.bd.obtenerImagenUsuario(this.usuario.nombre);
      console.log('Imagen de perfil cargada:', this.profileImage); // Depurar
    } catch (error) {
      console.log('Error al obtener la imagen del usuario, manteniendo la imagen por defecto');
      // profileImage ya se inicializa con la imagen predeterminada
    }
  }

  // Cargar otros datos necesarios
  await this.cargarUsuario();
  this.actualizarRecientesYCategorias();
  this.BotonCerrarSesion();
  this.autoSlide();

  // Suscribirse a la base de datos y cargar productos
  this.bd.dbReady().subscribe(ready => {
    if (ready) {
      this.cargarProductos();
    }
  });

  // Manejar la navegación y estados adicionales
  const navigation = this.router.getCurrentNavigation();
  if (navigation?.extras.state) {
    const user = navigation.extras.state['user'];
    if (user) {
      this.usuario = user.usuario;
      console.log('Usuario recibido:', this.usuario);
      if (this.usuario && this.usuario.nombre) {
        try {
          const imagenUsuario = await this.bd.obtenerImagenUsuario(this.usuario.nombre);
          if (imagenUsuario) {
            this.profileImage = imagenUsuario; // Actualiza la imagen si existe
            console.log('Imagen de perfil actualizada:', this.profileImage);
          }
        } catch (error) {
          console.log('Error al obtener la imagen del usuario recibido, manteniendo la imagen por defecto');
          // profileImage ya se inicializa con la imagen predeterminada
        }
      }
    }
  }

  // Actualizar los productos recientes y por categoría
  this.actualizarRecientesYCategorias();
}



async obtenerImagenUsuario(nombre: string): Promise<string> {
  try {
    console.log('Obteniendo imagen de usuario con nombre:', nombre);
    
    const imagen = await this.storage.getItem(`imagen_${nombre}`);
    
    if (imagen && imagen.startsWith('http')) {
      return imagen; // Retornar la URL de la imagen
    } else {
      return 'assets/img/nouser.png'; // Retornar imagen predeterminada
    }
  } catch (error) {
    console.log('Error al obtener la imagen del usuario:', error);
    return 'assets/img/nouser.png'; // En caso de error, devolver la imagen por defecto
  }
}

  detalleProducto(productoId: number){
    console.log('Detalle del producto', productoId);
    this.router.navigate(['/detalle', productoId]);
  }

  nextSlide() {
    this.currentIndex = (this.currentIndex + 1) % this.images.length;
  }

  prevSlide() {
    this.currentIndex = (this.currentIndex - 1 + this.images.length) % this.images.length;
  }

  autoSlide() {
    setInterval(() => {
      this.nextSlide();
    }, 6000); 
  }

  slideOpts = {
    initialSlide: 0,
    slidesPerView: 2, 
    spaceBetween: 10 
  };


  handleRefresh(event: CustomEvent) {
    setTimeout(() => {
      const refresher = event.target as HTMLIonRefresherElement;
      if (refresher) {
        refresher.complete(); 
      }
    }, 2000); 
  }

  @ViewChild('swiper')
  swiperRef: ElementRef | undefined;
  swiper?: Swiper;

  images = [
    'https://images.unsplash.com/photo-1580927752452-89d86da3fa0a',
    'https://images.unsplash.com/photo-1498050108023-c5249f4df085',
    'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRqFu_E_Xv8alQM7C0qNuVLHFjUKFCAfL-XNw&s',
    'https://tse3.mm.bing.net/th?id=OIG2.Z3Po8YdlRXB9P8cp9V_l&w=270&h=270&c=6&r=0&o=5&pid=ImgGn',
    'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR2-yVmglcofj30YGFBUqhMEpWsxEzrw4gXiw&s',
  ];


  constructor(private router:Router, private bd: ServicebdService, private platform: Platform, private alertController: AlertController, private storage: NativeStorage) {}

  //modificado
  async cargarUsuario() {
    try {
      const data = await this.storage.getItem('usuario');
      if (data) {
        this.usuario = data;
        console.log('Usuario cargado:', this.usuario?.nombre);
  
        // Limpiar imagen predeterminada mientras se carga la nueva
        this.profileImage = 'assets/img/nouser.png'; 
  
        // Verificar y obtener imagen para el usuario correcto
        if (this.usuario && this.usuario.nombre) {
          console.log('Cargando imagen de perfil para:', this.usuario.nombre);
          this.profileImage = await this.bd.obtenerImagenUsuario(this.usuario.nombre);
          console.log('Imagen de perfil cargada para:', this.usuario.nombre);
        } else {
          console.log('No se pudo cargar el nombre del usuario');
        }
      }
    } catch (error) {
      console.log('Error al cargar usuario:', error);
    }
  }  

  cargarProductos() {
    this.actualizarRecientesYCategorias();
    this.bd.fetchProductos().subscribe(productos => {
      this.productos = productos; 
      this.productosFiltrados = [...productos];
      console.log('Productos cargados: ', this.productos); 
    }, error => {
      console.error('Error al cargar productos', error);
    });
  }

  
  actualizarRecientesYCategorias() {
    this.bd.fetchProductos().subscribe(productos => {
      this.productos = productos;
      this.productosRecientes = this.productos.slice(-5).reverse();
      this.productosPorCategoria = {};
      this.productos.forEach(producto => {
        const categoria = producto.categoria || 'Otros';
        if (!this.productosPorCategoria[categoria]) {
          this.productosPorCategoria[categoria] = [];
        }
        this.productosPorCategoria[categoria].push(producto);
      });
      console.log('Productos recientes:', this.productosRecientes);
      console.log('Productos por categoría:', this.productosPorCategoria);
    }, error => {
      console.error('Error al cargar productos', error);
    });
  }

  swiperReady() {
    this.swiper = this.swiperRef?.nativeElement.swiper;
  }

  BotonCerrarSesion(){
    this.platform.backButton.subscribeWithPriority(10, async () => {
      const alert = await this.alertController.create({
        header: 'Cerrar Sesión',
        message: '¿Estás seguro de que deseas cerrar la sesión?',
        buttons: [
          {
            text: 'Cancelar',
            role: 'cancel',
            cssClass: 'secondary',
            handler: () => {
              console.log('La sesión no se cerró');
            }
          },
          {
            text: 'Cerrar Sesión',
            handler: () => {
              this.cerrarSesion();
            }
          }
        ]
      })
      await alert.present(); 
    })
  }

  async cerrarSesion(){
    try{
      await this.storage.remove('usuario');
      console.log('Datos de usuario eliminados correctamente');
      this.router.navigate(['/login']);
    }catch (e){
      console.log('Error al cerrar sesion', JSON.stringify(e));
    }
  }

  goNext() {
    this.swiper?.slideNext();
  }

  goPrev() {
    this.swiper?.slidePrev();
  }

  swiperSlideChanged(e: any) {
    console.log('changed: ', e);
  }

  carrito(){
    this.router.navigate(['/carrito']);
  }

  detalle(id: number){
    this.router.navigate(['/detalle', id]);
  }

  isAdmin(): boolean {
    return this.usuario ? this.usuario.es_admin : false;
  }
  
  irAAdministrador() {
    console.log("Navegando a la página de administración");
    this.router.navigate(['/administrador']);  
  }

  admin(){
    this.bd.establecerAdmin('ale');
  }

  perfil(){
    this.router.navigate(['tabs/perfil'])
  }

  toggleSearchBar() {
    this.mostrarBarraBusqueda = !this.mostrarBarraBusqueda;
  }

  filtrarProductos(event: any) {
    const valorBusqueda = event.target.value.toLowerCase();

    if (valorBusqueda && valorBusqueda.trim() !== '') {
      this.productosFiltrados = this.productos.filter(producto => 
        producto.nombre_producto.toLowerCase().includes(valorBusqueda)
      );
    } else {
      this.productosFiltrados = [...this.productos]; 
    }
  }

  mostrarIDsUsuarios() {
    this.bd.getUsuarios().then(usuarios => {
      this.idsUsuarios = usuarios.map(usuario => usuario.id);  
      console.log("IDs de los usuarios:", this.idsUsuarios);
    }).catch(error => {
      console.error("Error al obtener los usuarios:", error);
    });
  }
}
