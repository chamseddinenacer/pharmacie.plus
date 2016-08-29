import { Component } from '@angular/core';
import { NavController, LoadingController  } from 'ionic-angular';

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

  // Déclaration d'une variable locale de type Array de Pharmacies
  pharmacies: Pharmacie[];
  pharmaciesProvider: any;
  loader: any;

  // Injection du provider dans le constructor denotre page composant
  constructor(public nav: NavController, private loadingController: LoadingController, pharmaciesProvider: PharmaciesProvider) {

    this.pharmaciesProvider = pharmaciesProvider;

    this.displayLoader();

    pharmaciesProvider
      .load()
      // On assigne le résultat de la promesse à la variable locale pharmacies.
      .then(pharmacies => {
        this.loader.dismiss();
        return this.pharmacies = this.formatDistance(pharmacies);
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
        // Si l'option favoris est cochée, on recherche les pharmacies favorites,
        // sinon, on affiche la liste par défaut
        if ($(`#${item}`).attr('class') === 'sub-menu-item') {
          this.search(null);
        }else {
          this.searchFavorites();
        }
        break;

      // Bouton d'affichage du champ de recherche global
      case 'search':
        let $searchBar = $('ion-searchbar');
        if ($searchBar.is(':hidden'))
          $searchBar.show(500);
        else
          $searchBar.hide(500);
        break;
    }
  }

  // Navigue à la page de détails de la pharmacie
  goToDetails(event, pharmacie) {
    this.nav.push(PharmacieDetailsPage, {
      rs: pharmacie.rs,
      id: pharmacie._id
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
        return this.pharmacies = this.formatDistance(pharmacies);
      })
  }

  // Recherche des pharmacies sur l'api et affiche le résultat de la recherche
  search(searchTerm) {

    // Récupère la valeur de la barre de recherceh
    let term = searchTerm && searchTerm.target.value || '';

    // Recherche si au moins 1 caractère est saisie
    if (term.trim() == '' || term.trim().length < 1) {

      // Récupère les pharmacies et assigne à la variable locale pharmacies
      this.pharmaciesProvider
        .load()
        // Chargement de la liste des pharmacies par défaut
        .then(pharmacies => {
          return this.pharmacies = this.formatDistance(pharmacies);
        })
    } else {
      // Récupère les pharmacies recherchées
      this.pharmaciesProvider.searchPharmacies(term)
        .then(pharmacies => {
          return this.pharmacies = this.formatDistance(pharmacies);
        })
    }
  }

}
