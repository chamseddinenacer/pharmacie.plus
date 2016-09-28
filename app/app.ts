import {enableProdMode} from '@angular/core';
enableProdMode();

import {Component, ViewChild} from '@angular/core';
import {ionicBootstrap, Platform, MenuController, Nav} from 'ionic-angular';
import {StatusBar, Splashscreen, GoogleAnalytics} from 'ionic-native';

import {PushwooshService} from './providers/pushwoosh/ionic2-pushwoosh.service';
// Importantion du provider Subscriber
import {SubscriberProvider} from './providers/subscriber/subscriber';

import {PharmaciesPage} from './pages/pharmacies/pharmacies';
import {AboutPage} from './pages/about/about';

declare var _;

@Component({
  templateUrl: 'build/app.html',
  providers: [PushwooshService, SubscriberProvider]
})
class MyApp {
  @ViewChild(Nav) nav:Nav;

  // Page par défaut: liste des pharmacies.
  rootPage:any = PharmaciesPage;
  pages:Array<{title: string, component: any}>;

  constructor(public platform:Platform,
              public menu:MenuController,
              public pushwooshService:PushwooshService,
              public subscriberProvider:SubscriberProvider) {

    this.initializeApp();

    // On masque le splashscreen
    this.hideSplashScreen();

    // Initialisation du service de notification push
    this.pushwooshService.init();

    // set our app's pages
    this.pages = [
      {title: 'Liste des pharmacies', component: PharmaciesPage},
      {title: 'A propos', component: AboutPage}
    ];
  }

  initializeApp() {
    this.platform.ready().then(() => {
      // Okay, so the platform is ready and our plugins are available.
      // Here you can do any higher level native things you might need.
      StatusBar.styleDefault();
      StatusBar.backgroundColorByHexString('#4Da84d');

      GoogleAnalytics.debugMode();
      GoogleAnalytics.startTrackerWithId('UA-84949508-1');

      GoogleAnalytics.enableUncaughtExceptionReporting(true)
        .then((_success) => {console.log(_success)})
        .catch((_error) => {console.log(_error)})
    });
  }

  openPage(page) {
    // close the menu when clicking a link from the menu
    this.menu.close();
    // navigate to the new page if it is not the current page
    this.nav.setRoot(page.component);
  }

  hideSplashScreen() {
    if (Splashscreen) {
      setTimeout(() => {
        Splashscreen.hide();
      }, 100);
    }
  }

}

ionicBootstrap(MyApp);
