import { Component, ViewChild, ElementRef, EventEmitter, ApplicationRef, NgZone } from '@angular/core';
import { ModalController, NavController, NavParams, ToastController, Platform, LoadingController } from 'ionic-angular';
import { SocialSharing, Push } from 'ionic-native';


// Importantion du provider de Pharmacies
import {PharmaciesProvider} from '../../providers/pharmacies/pharmacies';
// Importantion du provider d'avis de pharmacie
import {OpinionsProvider} from '../../providers/opinions/opinions';
// Importantion du provider Subscriber
import {SubscriberProvider} from '../../providers/subscriber/subscriber';

// Importation du modèle de données Pharmacie
import {Pharmacie} from '../../models/pharmacie';

// Importation de la page de détail d'une pharmacie
import {OpinionPage} from '../opinion/opinion';

// Importation de la page de saisie des horaires de la pharmacie
import {HoursPage} from '../hours/hours';

declare var google;
declare var $;
declare var _;
declare var moment;

/*
  Generated class for the PharmacieDetailsPage page.

  See http://ionicframework.com/docs/v2/components/#navigation for more info on
  Ionic pages and navigation.
*/
@Component({
  templateUrl: 'build/pages/pharmacie-details/pharmacie-details.html',

  // Ajout du provider Pharmacies et Opinions
  providers: [PharmaciesProvider, OpinionsProvider, SubscriberProvider]
})
export class PharmacieDetailsPage {

  @ViewChild('map') mapElement: ElementRef;
  map: any;
  id: string;
  rs: string;
  pharmacie: Pharmacie = new Pharmacie;
  loader: any;
  options: string;
  moment: any;
  hours: { mo: string, tu: string, we: string, th: string, fr: string, sa: string, su: string};

  constructor(
              public modalCtrl: ModalController,
              private platform: Platform,
              public nav: NavController,
              private loadingController: LoadingController,
              private navParams: NavParams,
              private pharmaciesProvider: PharmaciesProvider,
              private opinionsProvider: OpinionsProvider,
              private subscriberProvider: SubscriberProvider,
              private applicationRef: ApplicationRef,
              private zone: NgZone,
              private toastController : ToastController) {

    this.moment = moment;
    this.platform = platform;

    // Récupération des paramètres id et raison sociale depuis les paramètres de navigation
    this.id = navParams.get('id');
    this.rs = navParams.get('rs');

    // Affichage de la mire de chargement
    this.loader = this.loadingController.create({
      content: 'Chargement en cours...'
    });
    this.loader.present();

    // Définition du segment Carte par défaut pour afficher la carte (au lieu des commentaires)
    this.options = 'map';

    // Récupère les détails de la pharmacie depuis l'API.
    pharmaciesProvider.loadDetails(this.id)
      .then( pharmacie => {
        this.pharmacie = pharmacie;
        this.pharmacie.isFavorite = this.isFavorite();
        this.pharmacie.favoriteIcon = this.isFavorite() ? 'star' : 'star-outline' ;

        this.fetchOpinions(); // Récupère les avis pour avoir la note moyenne de la pharmacie

        this.formatHours();

        this.loader.dismiss();  // On efface la mire de chargement
        this.displayMap();      // On affiche la carte avec la position de la pharmacie
      })
  }

  // Formate les horaires d'ouverture en une heure au format HH:mm
  formatHours() {
    if (this.pharmacie.hours) {

      function addZero(i) {
        if (i < 10) {
          i = "0" + i;
        }
        return i;
      }

      function formatDay(amo, amc, pmo, pmc) {

        if (amo == 0 && pmc == 1440)
          return 'Ouvert 24h/24';

        // Pas d'horaire le matin
        if (amo == 0 && amc == 0) {
          // Pas d'horaire l'après midi
          if (pmo == 0 || pmc == 0)
            return 'Fermé';
          else
            return `${addZero(Math.trunc(pmo/60))}:${addZero(pmo%60)}-${addZero(Math.trunc(pmc/60))}:${addZero(pmc%60)}`;

        // Horaires le matin
        } else {

          let hours = `${addZero(Math.trunc(amo/60))}:${addZero(amo%60)}-${addZero(Math.trunc(amc/60))}:${addZero(amc%60)}`;

          // Horaires l'après midi
          if (pmo != 0 && pmc != 0)
            hours += ` ${addZero(Math.trunc(pmo/60))}:${addZero(pmo%60)}-${addZero(Math.trunc(pmc/60))}:${addZero(pmc%60)}`;

          return hours;
        }
      };

      this.hours = {
        mo: formatDay(this.pharmacie.hours.mo.amo, this.pharmacie.hours.mo.amc, this.pharmacie.hours.mo.pmo, this.pharmacie.hours.mo.pmc),
        tu: formatDay(this.pharmacie.hours.tu.amo, this.pharmacie.hours.tu.amc, this.pharmacie.hours.tu.pmo, this.pharmacie.hours.tu.pmc),
        we: formatDay(this.pharmacie.hours.we.amo, this.pharmacie.hours.we.amc, this.pharmacie.hours.we.pmo, this.pharmacie.hours.we.pmc),
        th: formatDay(this.pharmacie.hours.th.amo, this.pharmacie.hours.th.amc, this.pharmacie.hours.th.pmo, this.pharmacie.hours.th.pmc),
        fr: formatDay(this.pharmacie.hours.fr.amo, this.pharmacie.hours.fr.amc, this.pharmacie.hours.fr.pmo, this.pharmacie.hours.fr.pmc),
        sa: formatDay(this.pharmacie.hours.sa.amo, this.pharmacie.hours.sa.amc, this.pharmacie.hours.sa.pmo, this.pharmacie.hours.sa.pmc),
        su: formatDay(this.pharmacie.hours.su.amo, this.pharmacie.hours.su.amc, this.pharmacie.hours.su.pmo, this.pharmacie.hours.su.pmc)
      };

    }
  }

  // Regarde dans le localStorage si la pharmacie fait partie des pharmacies favorites
  isFavorite(){
    if (!localStorage.getItem('favorites'))
      return false;

    let favorites = JSON.parse(localStorage.getItem('favorites'));
    return (favorites.indexOf(this.pharmacie._id) !== -1);
  }

  // Ajoute la pharmacie à la liste des pharmacies favorites
  toggleFavorite() {

    let $favorites = $('ion-icon#favorites');

    let isFavorites = $favorites.attr('class') === 'ion-md-star',
        classIcon,
        msgToast,
        favorites;

    // Si la pharmacie fait partie des pharmacies favorites
    if (isFavorites) {
      // On désabonne l'utilisateur aux commentaires de la pharmacie
      this.subscriberProvider.unsubscribe(this.pharmacie._id);

      classIcon = 'ion-md-star-outline';
      msgToast = 'Pharmacie retirée des favoris';

      // Mise a jour de la liste des pharmacies favorites
      favorites = JSON.parse(localStorage.getItem('favorites'));
      favorites = favorites.filter((item) => item != this.pharmacie._id);

    // Si la pharmacie ne fait pas partie des pharmacies favorites
    } else {

      // On abonne l'utilisateur aux commentaires de la pharmacie
      this.subscriberProvider.subscribe(this.pharmacie._id);

      classIcon = 'ion-md-star';
      msgToast = 'Pharmacie ajoutée aux favoris';

      if (localStorage.getItem('favorites')) {
        favorites = JSON.parse(localStorage.getItem('favorites'));
        favorites.push(this.pharmacie._id);
      } else {
        favorites = [this.pharmacie._id];
      }
    }

    // Sauvegarde de la liste des pharmacies favorites dans le localeStorage
    localStorage.setItem('favorites', JSON.stringify(favorites));


    $favorites.attr('class', classIcon);

    let toast = this.toastController.create({
      message: msgToast,
      duration: 3000,
      position: 'middle'
    });
    toast.present();

  }

  // Ouverture d'une application GPS du téléphone (google maps, waze) pour afficher l'itinéraire jusqu'à la pharmacie.
  navigateToPharmacie() {

    let destination = `${this.pharmacie.loc[1]},${this.pharmacie.loc[0]}`;

    if (this.platform.is('ios')){
      window.open('maps://?q=' + destination, '_system');
    } else {
      let label = encodeURI(`${this.pharmacie.numvoie} ${this.pharmacie.typvoie} ${this.pharmacie.voie}, ${this.pharmacie.cpville}`);
      window.open('geo:0,0?q=' + destination + '(' + label + ')', '_system');
    }
  }

  // Partage les infos de la pharmacie avec une application externe
  share() {

    SocialSharing.share(
        `${this.pharmacie.rs}

Adresse : ${this.pharmacie.numvoie} ${this.pharmacie.typvoie} ${this.pharmacie.voie}, ${this.pharmacie.cpville}
Tél: ${this.pharmacie.telephone}
Fax: ${this.pharmacie.fax}`,
        this.pharmacie.rs,
        '',
        ''
    ).then( result => {
        console.log(result);
    }).catch(err => {
        console.log(err);
    });
  }

  // Chargement de la carte google map centré sur la pharmacie
  displayMap() {

    setTimeout(function() {
      // Coordonnées géographique de la pharmacie
      let latLng = new google.maps.LatLng(this.pharmacie.loc[1], this.pharmacie.loc[0]);

      // Options de la carte
      let mapOptions = {
        center: latLng,
        zoom: 14,
        mapTypeId: google.maps.MapTypeId.ROADMAP
      }

      // Création de la carte
      this.map = new google.maps.Map(this.mapElement.nativeElement, mapOptions);

      // Ajout d'un marqueur sur la carte correspondant à l'emplacement de la pharmacie
      let marker = new google.maps.Marker({
        map: this.map,
        //animation: google.maps.Animation.BOUNCE,
        //animation: google.maps.Animation.DROP,
        icon: './img/marker.png',
        position: latLng
      });
    }.bind(this),0);
  }

  // Récupère les avis de la pharmacie et calcul la note moyenne.
  fetchOpinions() {

    // Récupération des avis depuis l'API en appelant la fonction load du provider Opinions.
    this.opinionsProvider.load(this.pharmacie._id)
      // On assigne le résultat de la promesse à la variable locale pharmacies.opinions.
      .then(opinions => {

        // Calcul de la note moyenne de la pharmacie à partir des notes de tous les avis.
        this.pharmacie.rate =  !_.isEmpty(opinions) ? (_.reduce(opinions, (result, item) => {return parseInt(result) + parseInt(item.rate);}, 0 ) / _.size(opinions)) : 0;

        this.pharmacie.opinions = opinions;
      });
  }

  displayHours(event) {



  }

  // Ouvre la page du formulaire d'ajout d'un avis sur la pharmacie.
  openModalNewOpinion(event) {
    let modal = this.modalCtrl.create(OpinionPage, { pharmacieId: this.pharmacie._id});
    modal.present();
  }

  // Ouvre la page du formulaire de modification des horaires de la pharmacie.
  openModalUpdateHours(event) {

    let leftEvent = new EventEmitter();

    leftEvent.subscribe(data => {
      this.pharmaciesProvider.loadDetails(this.id)
        .then( pharmacie => {
          this.pharmacie = pharmacie;
          this.pharmacie.isFavorite = this.isFavorite();
          this.pharmacie.favoriteIcon = this.isFavorite() ? 'star' : 'star-outline' ;
          this.fetchOpinions(); // Récupère les avis pour avoir la note moyenne de la pharmacie
          this.formatHours();
          this.displayMap();      // On affiche la carte avec la position de la pharmacie
          this.applicationRef.tick();
          this.zone.run(() => {console.log('enabled time travel');})
        })
    });

    let modal = this.modalCtrl.create(HoursPage, { pharmacie: this.pharmacie, event: leftEvent});
    modal.present();

  }

}
