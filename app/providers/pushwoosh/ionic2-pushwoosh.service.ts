/**
 * Service d'enregistrement du device auprès de PushWoosh pour recevoir les notifications push.
 */

import {Injectable} from "@angular/core";

import {Device} from 'ionic-native';
declare var cordova : any;

var PUSHWOOSH_APP_ID = 'BBDA9-09114';
var GOOGLE_PROJECT_NUMBER = '921632069444';


@Injectable()
export class PushwooshService {

  init() {

    if(!Device.device) {
      console.log("PushwooshService init: No device object available.  Skipping init.  (Probably not running in a deployed Cordova app.)");
      return;
    }

    switch (Device.device.platform) {
      case 'iOS':
        console.log('Starting iOS Pushwoosh initialization');
        this.initIOS();
        break;
      case 'Android':
        console.log('Starting Android Pushwoosh initialization');
        this.initAndroid();
        break;
      default:
        console.log('Unknown Cordova platform', Device.device.platform, '. Skipping Pushwoosh initialization');
    }
  }

  initIOS() {
    var pushNotification = cordova.require("pushwoosh-cordova-plugin.PushNotification");

    //set push notification callback before we initialize the plugin
    document.addEventListener('push-notification', function (event:any) {
      //get the notification payload
      var notification = event.notification;

      //display alert to the user for example
      alert(notification.aps.alert);

      //clear the app badge
      pushNotification.setApplicationIconBadgeNumber(0);
    });

    //initialize the plugin
    pushNotification.onDeviceReady({pw_appid: PUSHWOOSH_APP_ID});

    //register for pushes
    pushNotification.registerDevice((status) => {
        let deviceToken = status['deviceToken'];
        console.warn('registerDevice: ' + deviceToken);
      },
      (status) => {
        console.warn('failed to register : ' + JSON.stringify(status));
      }
    );

    //reset badges on app start
    pushNotification.setApplicationIconBadgeNumber(0);
  }

  initAndroid() {
    let pushNotification = cordova.require('pushwoosh-cordova-plugin.PushNotification');

    // Handler sur les pushs.
    document.addEventListener('push-notification', (event:any) => {
      let title    = event.notification.title;
      let userData = event.notification.userdata;

      if (typeof(userData) != "undefined") {
        console.warn('user data: ' + JSON.stringify(userData));
      }

      console.log(title);
    });

    //Initialise PushWoosh à partir de l'id du projet sous Google Play et de l'id de l'application sous PushWoosh
    pushNotification.onDeviceReady({projectid: GOOGLE_PROJECT_NUMBER, pw_appid: PUSHWOOSH_APP_ID});

    // Enregistrement du device auprès de Push Woosh
    pushNotification.registerDevice((status) => {
        let pushToken = status.pushToken;
        console.warn(`push token: ${pushToken}`);
        localStorage.setItem('pushToken', pushToken);
      },
      (status) => {
        console.warn(JSON.stringify(['failed to register ', status]));
      }
    );
  }

}
