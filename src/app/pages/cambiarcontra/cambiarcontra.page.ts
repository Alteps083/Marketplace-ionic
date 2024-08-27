import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-cambiarcontra',
  templateUrl: './cambiarcontra.page.html',
  styleUrls: ['./cambiarcontra.page.scss'],
})
export class CambiarcontraPage implements OnInit {

  constructor(private router:Router) { }

  ngOnInit() {
  }

  iniciarses(){
    this.router.navigate(['/login']);
  }

}
