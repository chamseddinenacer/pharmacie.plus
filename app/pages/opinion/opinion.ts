import {Component} from '@angular/core';
//import {FormBuilder, Validators} from '@angular/common';
import {ModalController, Platform, NavParams, ViewController, NavController, ToastController, LoadingController} from 'ionic-angular';

// Importantion du provider de Pharmacies
import {OpinionsProvider} from '../../providers/opinions/opinions';

import { REACTIVE_FORM_DIRECTIVES} from '@angular/forms';
//import {FormBuilder, FormGroup, Validators} from '@angular/forms';

import {FORM_DIRECTIVES, FormBuilder,  ControlGroup, Validators, AbstractControl} from '@angular/common';
import {IONIC_DIRECTIVES} from 'ionic-angular';


declare var $;
declare var moment;

@Component({
  selector: 'opinionForm',
  templateUrl: 'build/pages/opinion/opinion.html',
  directives: [IONIC_DIRECTIVES, FORM_DIRECTIVES, REACTIVE_FORM_DIRECTIVES],

  // Ajout du provider Pharmacies
  providers: [OpinionsProvider]
})
export class OpinionPage {
  pharmacieId: String;

  loader: any;

  constructor(
    public platform: Platform,
    public params: NavParams,
    public viewCtrl: ViewController,
    private navController: NavController,
    private toastController : ToastController,
    private opinionsProvider: OpinionsProvider,
    private loadingController: LoadingController
  ) {
    this.pharmacieId = params.get('pharmacieId');
  }

  // Affichage de la mire de chargment lors de la soumission du formulaire
  displayLoader() {
    this.loader = this.loadingController.create({
      content: `Envoi de l'avis en cours...`
    });
    this.loader.present();
  }

  // Envoi du formulaire d'ajout d'un avis
  doSendOpinion(): void {

    // Récupération des champs du formulaire
    let rate = $('#opinion-rate').val();
    let name = $('#opinion-name').children().val();
    let content = $('#opinion-content').children().val();
    let timestamp = moment().unix();

    // Si un des champs n'est pas saisi, on affiche un message
    if(!rate || !name || !content) {
      let toast = this.toastController.create({
        message: "Veuillez remplir tous les champs",
        duration: 3000,
        position: 'middle'
      });
      toast.present();

    // Si tous les champs sont saisie, on envoie le formulaire via le provider.
    } else {
      this.displayLoader();
      this.opinionsProvider
        .addOpinion({rate, name, content, timestamp}, this.pharmacieId)
        // On assigne le résultat de la promesse à la variable locale pharmacies.
        .then(opinions => {
          this.dismiss();
          this.loader.dismiss();
        });
    }
  }

  // Fermeture du formulaire et retour à la page précédente.
  dismiss() {
    this.viewCtrl.dismiss();
  }

  // Mets à jour la couleur des étoiles en fonction de celle sélectionnée par l'utilisateur
  // Et le champ caché contenant la note de la pharmacie.
  ratePharmacie(rating) {

    // On décolorie toutes les étoiles
    $('#rateStar5').css('color', '#999999').attr('class', 'ion-md-star-outline');
    $('#rateStar4').css('color', '#999999').attr('class', 'ion-md-star-outline');
    $('#rateStar3').css('color', '#999999').attr('class', 'ion-md-star-outline');
    $('#rateStar2').css('color', '#999999').attr('class', 'ion-md-star-outline');
    $('#rateStar1').css('color', '#999999').attr('class', 'ion-md-star-outline');

    // On colorie les étoiles en fonction de la note de l'utilisateur.
    switch(rating) {
      case 5: $('#rateStar5').css('color', '#ffd600').attr('class', 'ion-md-star');
      case 4: $('#rateStar4').css('color', '#ffd600').attr('class', 'ion-md-star');
      case 3: $('#rateStar3').css('color', '#ffd600').attr('class', 'ion-md-star');
      case 2: $('#rateStar2').css('color', '#ffd600').attr('class', 'ion-md-star');
      case 1: $('#rateStar1').css('color', '#ffd600').attr('class', 'ion-md-star');
    }

    // On affecte la valeur de la note de la pharmacie au champ input du formulaire pour pouvoir la récupérer lors de la soumission de celui-ci
    $('#opinion-rate').val(rating);
  }

}
