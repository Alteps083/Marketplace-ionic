import { Component, OnInit } from '@angular/core';
import { Router, NavigationExtras } from '@angular/router';
import { ServicebdService } from 'src/app/services/servicebd.service';

@Component({
  selector: 'app-mis-productos',
  templateUrl: './mis-productos.page.html',
  styleUrls: ['./mis-productos.page.scss'],
})
export class MisProductosPage implements OnInit {
  profileImage: string | null = null;

  constructor(private router:Router, private bd: ServicebdService) { }

  async ngOnInit() {
    const usuarioActual = this.bd.getUsuarioActual();
    if (usuarioActual && usuarioActual.nombre) {
      this.profileImage = await this.bd.obtenerImagenUsuario(usuarioActual.nombre);
    }
  }
  
  crear(){
    //crear logica de programación
    this.router.navigate(['/agregar']);
  }
}
