import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-modcontra',
  templateUrl: './modcontra.page.html',
  styleUrls: ['./modcontra.page.scss'],
})
export class ModcontraPage implements OnInit {

  password: string = '';
  showPassword: boolean = false;

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

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

home(){
    //crear logica de programación
    this.router.navigate(['/tabs/home']);
  }

}
