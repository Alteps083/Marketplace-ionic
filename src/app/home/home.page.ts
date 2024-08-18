import { Component, ElementRef, ViewChild } from '@angular/core';
import Swiper from 'swiper';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {

  @ViewChild('swiper')
  swiperRef: ElementRef | undefined;
  swiper?: Swiper;

  images = [
    'https://images.unsplash.com/photo-1580927752452-89d86da3fa0a',
    'https://images.unsplash.com/photo-1498050108023-c5249f4df085',
    'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRqFu_E_Xv8alQM7C0qNuVLHFjUKFCAfL-XNw&s',
    'https://tse3.mm.bing.net/th?id=OIG2.Z3Po8YdlRXB9P8cp9V_l&w=270&h=270&c=6&r=0&o=5&pid=ImgGn',
    'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR2-yVmglcofj30YGFBUqhMEpWsxEzrw4gXiw&s',
  ];


  constructor() {}

  swiperReady() {
    this.swiper = this.swiperRef?.nativeElement.swiper;
  }

  goNext() {
    this.swiper?.slideNext();
  }

  goPrev() {
    this.swiper?.slidePrev();
  }

  swiperSlideChanged(e: any) {
    console.log('changed: ', e);
  }

}
