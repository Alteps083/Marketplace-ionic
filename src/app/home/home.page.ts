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

  usuarioActual: Usuario | null = null;

  profileImage: string | null = null;

  currentIndex = 0;
  
  usuario: Usuario | null = null;

  productos: Producto[] = [];

  async ngOnInit() {
    this.cargarUsuario(); 
    this.BotonCerrarSesion();
    this.autoSlide();
    this.bd.dbReady().subscribe(ready => {
      if (ready){
        this.cargarProductos();
      }
    })

    this.usuarioActual = this.bd.getUsuarioActual();
    this.autoSlide();
    const navigation = this.router.getCurrentNavigation();
    if (navigation?.extras.state) {
      const user = navigation.extras.state['user'];
      if (user) {
        this.usuario = user.usuario;
        console.log('Usuario recibido:', this.usuario);
      }

    }

    const usuarioActual = this.bd.getUsuarioActual();
    if (usuarioActual && usuarioActual.nombre) {
      this.profileImage = await this.bd.obtenerImagenUsuario(usuarioActual.nombre);
    }

  }



  detalleProducto(productoId: Producto){
    console.log('Detalle del producto', productoId);
    this.router.navigate(['/detalle', { id: productoId.id }]);
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

  cargarUsuario(){
    this.storage.getItem('usuario').then((data: Usuario) => {
      if(data) {
        this.usuario = data;
      }
    }).catch(error => {
      console.log('Error al recuperar usuario: ', JSON.stringify(error));
    });
  }

  cargarProductos() {
    this.bd.fetchProductos().subscribe(productos => {
      this.productos = productos; 
      console.log('Productos cargados: ', this.productos); 
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

  perfil() {
  }

  swiperSlideChanged(e: any) {
    console.log('changed: ', e);
  }

  // hipervinculos
  chat(){
    //crear logica de programación
    this.router.navigate(['/chat']);
  }

  carrito(){
    //crear logica de programación
    this.router.navigate(['/carrito']);
  }

  detalle(){
    this.router.navigate(['/detalle']);
  }

  isAdmin(): boolean {
    return this.usuarioActual ? this.usuarioActual.es_admin : false;
  }
  irAAdministrador() {
    console.log("Navegando a la página de administración");
    this.router.navigate(['/administrador']);  // Navega hacia la página administrador
  }

  //para crear admin ingresar nombre del usuario al que quiera convertir en admin (funcion temporal)
  admin(){
    this.bd.establecerAdmin('ale');

  }



}
