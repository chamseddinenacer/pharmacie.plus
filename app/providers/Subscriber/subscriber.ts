import {Injectable} from '@angular/core';
import {Http, Response, RequestOptions, Headers, RequestMethod, Request, URLSearchParams} from '@angular/http';

/*
 Generated class for the SubscribesProvider provider.

 See https://angular.io/docs/ts/latest/guide/dependency-injection.html
 for more info on providers and Angular 2 DI.
 */
@Injectable()
export class SubscriberProvider {
  opinions: any = null;

  prod: string = 'http://api-pharmacieplus.rhcloud.com';
  preprod: string = 'http://localhost:8080';
  apiURL: string = this.prod;

  constructor(private http: Http) {}

  // Abonne l'utilisateur aux messages d'une pharmacie
  subscribe(idPharmacie: string) {

    let subscriber = localStorage.getItem('pushToken');

    return new Promise(resolve => {

      // On appelle l'API pour récupèrer les avis d'une pharmacie trié par ordre décroissant sur la date
      this.http.get(`${this.apiURL}/v1/subscribe?pharmacies=[${idPharmacie}]&subscriber=${subscriber}`)
        .subscribe(() => {
          resolve();
        });
    });
  }

  // Désabonne l'utilisateur aux messages d'une pharmacie
  unsubscribe(idPharmacie: string) {

    let subscriber = localStorage.getItem('pushToken');

    return new Promise(resolve => {

      // On appelle l'API pour récupèrer les avis d'une pharmacie trié par ordre décroissant sur la date
      this.http.get(`${this.apiURL}/v1/unsubscribe?pharmacies=[${idPharmacie}]&subscriber=${subscriber}`)
        .subscribe(() => {
          resolve();
        });
    });
  }
}
