import { Component } from '@angular/core';
import { NavController, LoadingController  } from 'ionic-angular';
import {Geolocation} from 'ionic-native'

// Importantion du provider de Pharmacies
import {PharmaciesProvider} from '../../providers/pharmacies/pharmacies';

// Importation du modèle de données Pharmacie
import {Pharmacie} from '../../models/pharmacie';

// Importation de la page de détail d'une pharmacie
import {PharmacieDetailsPage} from '../pharmacie-details/pharmacie-details';

declare var _;
declare var $;

/*
  Generated class for the PharmaciesPage page.

  See http://ionicframework.com/docs/v2/components/#navigation for more info on
  Ionic pages and navigation.
*/
@Component({
  templateUrl: 'build/pages/pharmacies/pharmacies.html',
  providers: [PharmaciesProvider]
})
export class PharmaciesPage {

  public searchValue: string;

  // Déclaration d'une variable locale de type Array de Pharmacies
  pharmacies: Pharmacie[];
  pharmaciesProvider: any;
  loader: any;

  // Injection du provider dans le constructor denotre page composant
  constructor(public nav: NavController, private loadingController: LoadingController, pharmaciesProvider: PharmaciesProvider) {
    this.searchValue = "";
    this.pharmaciesProvider = pharmaciesProvider;

    this.displayLoader();

    pharmaciesProvider
      .load()
      // On assigne le résultat de la promesse à la variable locale pharmacies.
      .then(pharmacies => {
        this.loader.dismiss();
        this.pharmacies = this.formatDistance(pharmacies);
        return this.pharmacies = this.resolveOpen(pharmacies);
      });
  }

  displayLoader() {
    this.loader = this.loadingController.create({
      content: 'Chargement en cours...'
    });
    this.loader.present();
  }

  // Action lorsque l'utilisateur clique sur un élément du sous menu.
  subMenuItemTapped(event, item) {

    $(`#${item}`).toggleClass('sub-menu-item-selected');

    switch(item) {
      // Bouton d'affichage des pharmacies favorites
      case 'favorites':
        break;

      // Bouton d'affichage du champ de recherche global
      case 'search':
        let $searchBar = $('ion-searchbar');
        if ($searchBar.is(':hidden'))
          $searchBar.show(500);
        else
          $searchBar.hide(500);
        break;

      // Bouton d'affichage des pharmaices ouvertes
      case 'open':
        break;
    }
    this.search(null);
  }

  // Navigue à la page de détails de la pharmacie
  goToDetails(event, pharmacie) {
    this.nav.push(PharmacieDetailsPage, {
      rs: pharmacie.rs,
      id: pharmacie._id
    });
  }

  // Pour chaque pharmacie, regarde si elle est ouverte ou fermée en fonction de l'heure actuelle.
  // Et mets dans le champ open, résultat.
  resolveOpen(pharmacies) {

    let hourNow = Math.trunc(new Date().getHours() * 60 + new Date().getMinutes());
    let day;
    switch(new Date().getDay()) {
      case 1: day = 'mo'; break;
      case 2: day = 'tu'; break;
      case 3: day = 'we'; break;
      case 4: day = 'th'; break;
      case 5: day = 'fr'; break;
      case 6: day = 'sa'; break;
      case 0: day = 'su'; break;
    }

    function addZero(i) {
      if (i < 10) {
        i = "0" + i;
      }
      return i;
    }

    function formatHours(hour){
      return `${addZero(Math.trunc(hour/60))}:${addZero(Math.trunc(hour%60))}`;
    }

    return _.map(pharmacies, (pharmacie) => {
      let hours = pharmacie.hours;

      // Pas d'horaire renseignés
      if (!hours) {
        pharmacie.open = 'Horaires non renseignés';
        pharmacie.status = 2;

      }else {
        // Horaires du matin renseignés
        if (pharmacie.hours[day].amo) {

          // On est la matin et la pharmacie est ouverte
          if (hourNow > pharmacie.hours[day].amo && hourNow < pharmacie.hours[day].amc) {
            pharmacie.open = `Ouverte jusqu'à ${formatHours(pharmacie.hours[day].amc)}`;
            pharmacie.status = 1;

          // Horaires de l'après-midi renseignés
          } else if (pharmacie.hours[day].pmo) {
            // On est l'après midi et la pharmacie est ouverte
            if (hourNow > pharmacie.hours[day].pmo && hourNow < pharmacie.hours[day].pmc) {
              pharmacie.open = `Ouverte jusqu'à ${formatHours(pharmacie.hours[day].pmc)}`;
              pharmacie.status = 1;
            // Pharmacie fermée
            } else {
              pharmacie.status = 0;
              if (hourNow > pharmacie.hours[day].amc && hourNow < pharmacie.hours[day].pmo) {
                pharmacie.open = `Fermée (Ouverture à ${formatHours(pharmacie.hours[day].pmo)})`; // Ouvre l'après midi
              } else if (hourNow < pharmacie.hours[day].amo){
                pharmacie.open = `Fermée (Ouverture à ${formatHours(pharmacie.hours[day].amo)})`; // Ouvre le matin
              } else {
                pharmacie.open = `Fermée`;
              }
            }
          // Pas d'horaires renseignés pour l'après-midi.
          } else {
            pharmacie.status = 0;
            pharmacie.open = `Fermée`;
          }

        // Horaires renseignés que pour l'après-midi
        } else if (pharmacie.hours[day].pmo) {

          // On est l'après midi et la pharmacie est ouverte
          if (hourNow > pharmacie.hours[day].pmo && hourNow < pharmacie.hours[day].pmc) {
            pharmacie.open = `Ouverte jusqu'à ${formatHours(pharmacie.hours[day].pmc)}`;
            pharmacie.status = 1;
            // Pharmacie fermée
          } else if (hourNow < pharmacie.hours[day].pmo){
            pharmacie.open = `Fermée (Ouverture à ${formatHours(pharmacie.hours[day].pmo)})`;
          } else {
            pharmacie.status = 0;
            pharmacie.open = `Fermée`;
          }
        } else {
          pharmacie.open = 'Fermée';
          pharmacie.status = 0;
        }
      }
      return pharmacie;
    });
  }

  // Transforme les distances brut en format mètre ou km.
  formatDistance(pharmacies) {
    return _.map(pharmacies, (pharmacie) => {
      let distance = pharmacie.distance;

      if (distance) {
        if (pharmacie.distance < 1000)
          distance += ' m';
        else {
          distance += '';
          distance = distance.substr(0, distance.length -2);
          distance = distance.substr(0, distance.length -1) + ',' + distance.substr(distance.length -1, distance.length) + ' km';
        }
        pharmacie.distance = distance;
      }
      return pharmacie;
    });
  }

  // Recherche les pharmacies favorites via l'API et les affiches.
  searchFavorites() {

    // Récupère la valeur de la barre de recherceh
    let favorites = localStorage.getItem('favorites').replace(/"/g,'') || '';

    this.displayLoader();

    // Récupère les pharmacies favorites
    this.pharmaciesProvider.searchFavoritesPharmacies(favorites)
      .then(pharmacies => {
        this.loader.dismiss();
        this.pharmacies = this.resolveOpen(pharmacies);
        return this.pharmacies = this.formatDistance(pharmacies);
      })
  }

  // Recherche les pharmacies ouvertes
  searchOpened() {

    this.displayLoader();

    // Récupère les pharmacies favorites
    this.pharmaciesProvider.searchOpenedPharmacies()
      .then(pharmacies => {
        this.loader.dismiss();
        this.pharmacies = this.resolveOpen(pharmacies);
        return this.pharmacies = this.formatDistance(pharmacies);
      })
  }

  // Recherche des pharmacies sur l'api et affiche le résultat de la recherche
  search(searchTerm) {

    let isNotOpen = $(`#open`).attr('class') === 'sub-menu-item';
    let isNotFavorites = $(`#favorites`).attr('class') === 'sub-menu-item';
    let isNotSearch = $(`#search`).attr('class') === 'sub-menu-item';
    let isSearchValue = false;
    let params = [];

    // Ajout du paramètre des pharmacies favorites
    if (!isNotFavorites) {
      // Récupère la valeur de la barre de recherceh
      let favorites = localStorage.getItem('favorites').replace(/"/g,'') || '';
      params.push(`_id=${favorites}`);
    }

    // Ajout du paramètre des pharmacies ouvertes
    if (!isNotOpen) {
      let hourNow = Math.trunc(new Date().getHours() * 60 + new Date().getMinutes());
      let day;

      switch(new Date().getDay()) {
        case 1: day = 'mo'; break;
        case 2: day = 'tu'; break;
        case 3: day = 'we'; break;
        case 4: day = 'th'; break;
        case 5: day = 'fr'; break;
        case 6: day = 'sa'; break;
        case 0: day = 'su'; break;
      }
      params.push(`hours.${day}=${hourNow}`);
    }

    // Ajout du paramètre de recherche
    if (!isNotSearch) {

      if (searchTerm){
        this.searchValue = searchTerm.target.value;
      }

      isSearchValue = (this.searchValue.trim() != '' || this.searchValue.trim().length > 0);

      if (isSearchValue) {
        params.push(`cpville=*${this.searchValue.trim()}*`);
      }

    }
    !searchTerm && this.displayLoader();
    // Ajout de la géoloc si il n'y a pas les favoris et une valeur de recherche
    if (isNotFavorites && !isSearchValue) {
      Geolocation.getCurrentPosition().then((position) => {
        params.push(`loc=[${position.coords.longitude},${position.coords.latitude}]`);

        this.pharmaciesProvider
          .searchMultiParams(params)
          // Chargement de la liste des pharmacies par défaut
          .then(pharmacies => {
            this.pharmacies = this.resolveOpen(pharmacies);
            this.pharmacies = this.formatDistance(pharmacies);
            !searchTerm && this.loader.dismiss();
          });

      }, (err) => {
        this.pharmaciesProvider
          .searchMultiParams(params)
          // Chargement de la liste des pharmacies par défaut
          .then(pharmacies => {
            this.pharmacies = this.resolveOpen(pharmacies);
            this.pharmacies = this.formatDistance(pharmacies);
            !searchTerm && this.loader.dismiss();
          });
      });
    } else {

      this.pharmaciesProvider
        .searchMultiParams(params)
        // Chargement de la liste des pharmacies par défaut
        .then(pharmacies => {
          this.pharmacies = this.resolveOpen(pharmacies);
          this.pharmacies = this.formatDistance(pharmacies);
          !searchTerm && this.loader.dismiss();
        });
    }
  }

}
