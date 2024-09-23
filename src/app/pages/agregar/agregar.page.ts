import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';


@Component({
  selector: 'app-agregar',
  templateUrl: './agregar.page.html',
  styleUrls: ['./agregar.page.scss'],
})
export class AgregarPage implements OnInit {
  imagePreviews: string[] = [];

  handleRefresh(event: CustomEvent) {
    setTimeout(() => {
      const refresher = event.target as HTMLIonRefresherElement;
      if (refresher) {
        refresher.complete(); 
      }
    }, 2000); 
  }

  triggerFileInput() {
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    fileInput.click();
  }

  constructor(private router: Router) { }

  onImagesSelected(event: any){
    const files = event.target.files;
    for(let i = 0; i < files.length; i++){
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.imagePreviews.push(e.target.result);
      };
      reader.readAsDataURL(files[i]);
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
