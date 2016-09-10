import {Injectable} from '@angular/core';
import {Http, RequestOptions, Headers, RequestMethod, Request} from '@angular/http';
import {Geolocation} from 'ionic-native';
import 'rxjs/add/operator/map';

// Importation du modèle de données d'une pharmacie
import {Pharmacie} from '../../models/pharmacie'


/*
  Generated class for the PharmaciesProvider provider.

  See https://angular.io/docs/ts/latest/guide/dependency-injection.html
  for more info on providers and Angular 2 DI.
*/
@Injectable()
export class PharmaciesProvider {
  pharmacies: any = null;

  prod: string = 'http://api-pharmacieplus.rhcloud.com';
  preprod: string = 'http://localhost:8080';
  apiURL: string = this.prod;

  constructor(private http: Http) {}

  // Récupère la liste des pharmacies de la plus proche à la plus éloignée.
  load() {
    // Si les pharmacies sont déjà chargées
    //if (this.pharmacies) {
    //  return Promise.resolve(this.pharmacies);
    //}

    // Si les pharmacies n'ont pas encore été récupérées
    return new Promise(resolve => {

      // On récupère la position courante de l'utilisateur
      Geolocation.getCurrentPosition().then((position) => {

        // On appelle l'API pour récupèrer les pharmacies
        this.http.get(this.apiURL + `/v1/pharmacies/locations?long=${position.coords.longitude}&lat=${position.coords.latitude}`)
          .map(res => <Array<Pharmacie>>(res.json()))
          .subscribe(pharmacies => {
            this.pharmacies = pharmacies;
            resolve(this.pharmacies);
          });
      }, (err) => {
        console.error(err);
      });

    });
  }

  // Récupère les détails d'une pharmacie depuis l'API api.pharmacieplus
  loadDetails(id: string) {

    // Récupère les données de l'API et les retourne en tant que promesse.
    return new Promise<Pharmacie>(resolve => {

      this.http.get(`${this.apiURL}/v1/pharmacies/${id}`)
        .map(res => <Pharmacie>(res.json()))
        .subscribe(pharmacie => {
          resolve(pharmacie);
        });
    });
  }

  // Recherche une pharmacie
  searchPharmacies(searchParam: string) {

    return new Promise<Array<Pharmacie>>(resolve => {

      this.http.get(`${this.apiURL}/v1/pharmacies/search?cpville=*${searchParam}*`)
        // cast le resultat en un tableau de pharmacie
        .map(res => <Array<Pharmacie>>(res.json()))
        .subscribe(pharmacies => {
          resolve(pharmacies);
        });
    });
  }

  // Récupère les pharmacies favorites
  searchFavoritesPharmacies(listIdPharmacie: string) {

    return new Promise<Array<Pharmacie>>(resolve => {

      this.http.get(`${this.apiURL}/v1/pharmacies/search?_id=${listIdPharmacie}`)
        // cast le resultat en un tableau de pharmacie
        .map(res => <Array<Pharmacie>>(res.json()))
        .subscribe(pharmacies => {
          resolve(pharmacies);
        });
    });
  }

  // Met a jour les horaires d'ouverture d'une pharmacie
  patchHours(hours, idPharmacie) {

    let headers = new Headers({ 'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8' });
    let options = new RequestOptions({
      headers: headers,
      method: RequestMethod.Post,
      url: `${this.apiURL}/v1/pharmacies/${idPharmacie}`,
      body: this.jsonToFormData({hours: JSON.stringify(hours)})
    });

    return this.http.request(new Request(options))
      .map(res => res.json() || {} );

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

