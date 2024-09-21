import { Component, OnInit } from '@angular/core';
import { Router, NavigationExtras } from '@angular/router';

@Component({
  selector: 'app-detalle',
  templateUrl: './detalle.page.html',
  styleUrls: ['./detalle.page.scss'],
})
export class DetallePage implements OnInit {

  constructor(private router:Router) { }

  ngOnInit() {
  }
  
  perfil() {
    this.router.navigate(['/tabs/perfil']);
  }

  vendedor(){
    this.router.navigate(['/tabs/chat'])
  }
}
