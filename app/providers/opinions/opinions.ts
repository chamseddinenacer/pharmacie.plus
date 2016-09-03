import {Injectable} from '@angular/core';
import {Http, Response, RequestOptions, Headers, RequestMethod, Request, URLSearchParams} from '@angular/http';

// Importation du modèle de données d'une pharmacie
import {Opinion} from '../../models/opinion'

/*
 Generated class for the OpinionsProvider provider.

 See https://angular.io/docs/ts/latest/guide/dependency-injection.html
 for more info on providers and Angular 2 DI.
 */
@Injectable()
export class OpinionsProvider {
  opinions: any = null;

  prod: string = 'http://api-pharmacieplus.rhcloud.com';
  preprod: string = 'http://localhost:8080';
  apiURL: string = this.prod;

  constructor(private http: Http) {}

  // Récupère la liste des opinions d'une pharmacie
  load(idPharmacie: string) {

    return new Promise(resolve => {

        // On appelle l'API pour récupèrer les avis d'une pharmacie trié par ordre décroissant sur la date
        this.http.get(`${this.apiURL}/v1/pharmacies/${idPharmacie}/opinions?sort=timestamp&desc=timestamp`)
          .map(res => <Array<Opinion>>(res.json()))
          .subscribe(opinions => {
            resolve(opinions);
          });
      });
  }

  // Appel de l'API pour ajouter l'avis de la pharmacie en base de données.
  addOpinion(opinion, idPharmacie) {

    let headers = new Headers({ 'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8' });
    let options = new RequestOptions({
      headers: headers,
      method: RequestMethod.Post,
      url: `${this.apiURL}/v1/pharmacies/${idPharmacie}/opinions/`,
      body: this.jsonToFormData(opinion)
    });

    return new Promise(resolve => {

      this.http.request(new Request(options))
        .map(res => res.json() || {} )
        .subscribe(opinions => {
          resolve(opinions);
        });
    });
  }

  // Transforme un objet JSON en chaine de type FormData pour envoyer des données dans une requête en POST
  jsonToFormData(obj) {
      let parts = [];
      for (let key in obj) {
          if (obj.hasOwnProperty(key)) {
              parts.push(encodeURIComponent(key) + '=' + encodeURIComponent(obj[key]));
          }
      }
      return parts.join('&');
  }

}
