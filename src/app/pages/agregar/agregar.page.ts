import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';


@Component({
  selector: 'app-agregar',
  templateUrl: './agregar.page.html',
  styleUrls: ['./agregar.page.scss'],
})
export class AgregarPage implements OnInit {
  imageSrc: string | ArrayBuffer | null = null;

  handleRefresh(event: CustomEvent) {
    setTimeout(() => {
      const refresher = event.target as HTMLIonRefresherElement;
      if (refresher) {
        refresher.complete(); 
      }
    }, 2000); 
  }

  constructor(private router: Router) { }

  onFileSelected(event: any){
    const file = event.target.files[0];

    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        this.imageSrc = reader.result;
      };
      reader.readAsDataURL(file);
    }
  }

  onSubmit(form: any){
    if(form.valid){
      console.log('Datos del producto: ', form.value);
    }
  }

  homead(){
    this.router.navigate(['/tabs/homeadmin']);
  }

  ngOnInit() {
  }

}
