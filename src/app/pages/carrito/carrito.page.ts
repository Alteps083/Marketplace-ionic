import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-carrito',
  templateUrl: './carrito.page.html',
  styleUrls: ['./carrito.page.scss'],
})
export class CarritoPage implements OnInit {

  handleRefresh(event: CustomEvent) {
    setTimeout(() => {
      const refresher = event.target as HTMLIonRefresherElement;
      if (refresher) {
        refresher.complete(); // Completa el refresco
      }
    }, 2000); // Simula una carga de 2 segundos
  }

  constructor(private router: Router) { }

  ngOnInit() {
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

home(){
  //crear logica de programación
  this.router.navigate(['/home']);
}
}
