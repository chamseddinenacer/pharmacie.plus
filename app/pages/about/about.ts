import {Component} from '@angular/core';
import {NavController, Platform} from 'ionic-angular';
import {GoogleAnalytics } from 'ionic-native';

@Component({
  templateUrl: 'build/pages/about/about.html'
})
export class AboutPage {

  constructor(
    private navController: NavController,
    private platform: Platform
  ) {
    this.platform.ready().then(() => {
       GoogleAnalytics.trackView('about');
    });
  }

}
