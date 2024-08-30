import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-perfil',
  templateUrl: './perfil.page.html',
  styleUrls: ['./perfil.page.scss'],
})
export class PerfilPage implements OnInit {

  handleRefresh(event: CustomEvent) {
    setTimeout(() => {
      const refresher = event.target as HTMLIonRefresherElement;
      if (refresher) {
        refresher.complete(); // Completa el refresco
      }
    }, 2000); // Simula una carga de 2 segundos
  }

  constructor(private router:Router) { }

  ngOnInit() {
  }
  modperfil(){
    //crear logica de programación
    this.router.navigate(['/modperfil']);
  }
  modcontra(){
    //crear logica de programación
    this.router.navigate(['/modcontra']);
  }
}
