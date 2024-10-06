import { Component } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { every } from 'rxjs';
import { register } from 'swiper/element/bundle';
import { ServicebdService } from './services/servicebd.service';
register();

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent {
  VerMenu = true;

  constructor(private router: Router , private bd: ServicebdService) {
    this.router.events.subscribe((event) =>{
      if(event instanceof NavigationEnd) {
        this.updateMenuVisibility(event.url)
      }
    });
    this.bd.crearConexion();
  }

  updateMenuVisibility(url: string){
    const hiddenRoutes = ['/login', '/register', '/cambiarcontra'];
    this.VerMenu = !hiddenRoutes.includes(url);
  }
}
