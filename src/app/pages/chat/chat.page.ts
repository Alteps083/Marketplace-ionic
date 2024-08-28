import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.page.html',
  styleUrls: ['./chat.page.scss'],
})
export class ChatPage implements OnInit {

  handleRefresh(event: CustomEvent) {
    setTimeout(() => {
      const refresher = event.target as HTMLIonRefresherElement;
      if (refresher) {
        refresher.complete(); 
      }
    }, 2000); 
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

}
