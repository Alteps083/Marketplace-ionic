import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import Swiper from 'swiper';
import { Router } from '@angular/router';
import { ServicebdService } from 'src/app/services/servicebd.service';


@Component({
  selector: 'app-homeadmin',
  templateUrl: './homeadmin.page.html',
  styleUrls: ['./homeadmin.page.scss'],
})
export class HomeadminPage implements OnInit {

  profileImage: string | null = null;

  usuario: string = "";

  handleRefresh(event: CustomEvent) {
    setTimeout(() => {
      const refresher = event.target as HTMLIonRefresherElement;
      if (refresher) {
        refresher.complete(); // Completa el refresco
      }
    }, 2000); // Simula una carga de 2 segundos
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


  constructor(private router:Router, private bd: ServicebdService) {}

  swiperReady() {
    this.swiper = this.swiperRef?.nativeElement.swiper;
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

  // hipervinculos
  chat(){
    //crear logica de programación
    this.router.navigate(['/chat']);
  }

  perfil(){
    //crear logica de programación
    this.router.navigate(['/perfil']);
  }
  
  carrito(){
    //crear logica de programación
    this.router.navigate(['/carrito']);
  }

  detalle(){
    this.router.navigate(['/detalle']);
  }

  modificar(){
    this.router.navigate(['/modificar']);
  }

  agregar(){
    this.router.navigate(['/agregar']);
  }

  async ngOnInit() {
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

}
