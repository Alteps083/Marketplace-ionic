import { Component, OnInit } from '@angular/core';
import { Router, NavigationExtras } from '@angular/router';
import { AnimationController } from '@ionic/angular';

@Component({
  selector: 'app-tabs',
  templateUrl: './tabs.page.html',
  styleUrls: ['./tabs.page.scss'],
})
export class TabsPage implements OnInit {

  constructor(private animationCtrl: AnimationController) { }

  ionViewWillEnter() {
    const tabs = document.querySelector('ion-tabs');

    if (tabs) {
      const animation = this.animationCtrl.create()
        .addElement(tabs)
        .duration(500)
        .easing('ease-in-out')
        .fromTo('opacity', 0.5, 1)
        .fromTo('transform', 'translateY(20px)', 'translateY(0px)');

      animation.play();
    }
  }

  ngOnInit() {
  }
  
}
