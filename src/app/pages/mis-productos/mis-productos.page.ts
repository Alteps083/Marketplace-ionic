import { Component, OnInit } from '@angular/core';
import { Router, NavigationExtras } from '@angular/router';

@Component({
  selector: 'app-mis-productos',
  templateUrl: './mis-productos.page.html',
  styleUrls: ['./mis-productos.page.scss'],
})
export class MisProductosPage implements OnInit {

  constructor(private router:Router) { }

  ngOnInit() {
  }
  
  crear(){
    //crear logica de programación
    this.router.navigate(['/agregar']);
  }
}
