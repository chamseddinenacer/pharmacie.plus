import {Component, EventEmitter} from '@angular/core';
//import {FormBuilder, Validators} from '@angular/common';
import {ModalController, Platform, NavParams, ViewController, NavController, ToastController, LoadingController} from 'ionic-angular';

// Importantion du provider de Pharmacies
import {PharmaciesProvider} from '../../providers/pharmacies/pharmacies';

// Importation du modèle de données Pharmacie
import {Pharmacie} from '../../models/pharmacie';

declare var $;
declare var moment;
declare var _;

@Component({
  selector: 'opinionForm',
  templateUrl: 'build/pages/hours/hours.html',

  // Ajout du provider Pharmacies
  providers: [PharmaciesProvider]
})
export class HoursPage {
  pharmacie: Pharmacie;
  leftEvent: EventEmitter<string>;

  loader: any;

  public moAmo;
  public moAmc;
  public moPmo;
  public moPmc;

  public tuAmo;
  public tuAmc;
  public tuPmo;
  public tuPmc;

  public weAmo;
  public weAmc;
  public wePmo;
  public wePmc;

  public thAmo;
  public thAmc;
  public thPmo;
  public thPmc;

  public frAmo;
  public frAmc;
  public frPmo;
  public frPmc;

  public saAmo;
  public saAmc;
  public saPmo;
  public saPmc;

  public suAmo;
  public suAmc;
  public suPmo;
  public suPmc;

  constructor(
    public platform: Platform,
    public params: NavParams,
    public viewCtrl: ViewController,
    private navController: NavController,
    private toastController : ToastController,
    private pharmaciesProvider: PharmaciesProvider,
    private loadingController: LoadingController
  ) {
    this.pharmacie = params.get('pharmacie');
    this.leftEvent = params.get('event');
    this.initHoursForm();
  }

  // Initialise la valeur des champs du formulaire avec les heures de la pharmacie. 0 si pas d'horaires
  initHoursForm() {

    // Fonction qui ajoute un zéro devant un chiffre < 10.
    let twoDigits = (n) => (n < 10) && '0' + n || n;

    // Modification d'horaires existantes
    if (this.pharmacie.hours) {

      let h = this.pharmacie.hours;

      this.moAmo = `${twoDigits(Math.trunc(h.mo.amo/60))}:${twoDigits(h.mo.amo%60)}`;
      this.moAmc = `${twoDigits(Math.trunc(h.mo.amc/60))}:${twoDigits(h.mo.amc%60)}`;
      this.moPmo = `${twoDigits(Math.trunc(h.mo.pmo/60))}:${twoDigits(h.mo.pmo%60)}`;
      this.moPmc = `${twoDigits(Math.trunc(h.mo.pmc/60))}:${twoDigits(h.mo.pmc%60)}`;
      this.tuAmo = `${twoDigits(Math.trunc(h.tu.amo/60))}:${twoDigits(h.tu.amo%60)}`;
      this.tuAmc = `${twoDigits(Math.trunc(h.tu.amc/60))}:${twoDigits(h.tu.amc%60)}`;
      this.tuPmo = `${twoDigits(Math.trunc(h.tu.pmo/60))}:${twoDigits(h.tu.pmo%60)}`;
      this.tuPmc = `${twoDigits(Math.trunc(h.tu.pmc/60))}:${twoDigits(h.tu.pmc%60)}`;
      this.weAmo = `${twoDigits(Math.trunc(h.we.amo/60))}:${twoDigits(h.we.amo%60)}`;
      this.weAmc = `${twoDigits(Math.trunc(h.we.amc/60))}:${twoDigits(h.we.amc%60)}`;
      this.wePmo = `${twoDigits(Math.trunc(h.we.pmo/60))}:${twoDigits(h.we.pmo%60)}`;
      this.wePmc = `${twoDigits(Math.trunc(h.we.pmc/60))}:${twoDigits(h.we.pmc%60)}`;
      this.thAmo = `${twoDigits(Math.trunc(h.th.amo/60))}:${twoDigits(h.th.amo%60)}`;
      this.thAmc = `${twoDigits(Math.trunc(h.th.amc/60))}:${twoDigits(h.th.amc%60)}`;
      this.thPmo = `${twoDigits(Math.trunc(h.th.pmo/60))}:${twoDigits(h.th.pmo%60)}`;
      this.thPmc = `${twoDigits(Math.trunc(h.th.pmc/60))}:${twoDigits(h.th.pmc%60)}`;
      this.frAmo = `${twoDigits(Math.trunc(h.fr.amo/60))}:${twoDigits(h.fr.amo%60)}`;
      this.frAmc = `${twoDigits(Math.trunc(h.fr.amc/60))}:${twoDigits(h.fr.amc%60)}`;
      this.frPmo = `${twoDigits(Math.trunc(h.fr.pmo/60))}:${twoDigits(h.fr.pmo%60)}`;
      this.frPmc = `${twoDigits(Math.trunc(h.fr.pmc/60))}:${twoDigits(h.fr.pmc%60)}`;
      this.saAmo = `${twoDigits(Math.trunc(h.sa.amo/60))}:${twoDigits(h.sa.amo%60)}`;
      this.saAmc = `${twoDigits(Math.trunc(h.sa.amc/60))}:${twoDigits(h.sa.amc%60)}`;
      this.saPmo = `${twoDigits(Math.trunc(h.sa.pmo/60))}:${twoDigits(h.sa.pmo%60)}`;
      this.saPmc = `${twoDigits(Math.trunc(h.sa.pmc/60))}:${twoDigits(h.sa.pmc%60)}`;
      this.suAmo = `${twoDigits(Math.trunc(h.su.amo/60))}:${twoDigits(h.su.amo%60)}`;
      this.suAmc = `${twoDigits(Math.trunc(h.su.amc/60))}:${twoDigits(h.su.amc%60)}`;
      this.suPmo = `${twoDigits(Math.trunc(h.su.pmo/60))}:${twoDigits(h.su.pmo%60)}`;
      this.suPmc = `${twoDigits(Math.trunc(h.su.pmc/60))}:${twoDigits(h.su.pmc%60)}`;

    // Nouvelle horaires
    }else {

      this.moAmo = '00:00';
      this.moAmc = '00:00';
      this.moPmo = '00:00';
      this.moPmc = '00:00';

      this.tuAmo = '00:00';
      this.tuAmc = '00:00';
      this.tuPmo = '00:00';
      this.tuPmc = '00:00';

      this.weAmo = '00:00';
      this.weAmc = '00:00';
      this.wePmo = '00:00';
      this.wePmc = '00:00';

      this.thAmo = '00:00';
      this.thAmc = '00:00';
      this.thPmo = '00:00';
      this.thPmc = '00:00';

      this.frAmo = '00:00';
      this.frAmc = '00:00';
      this.frPmo = '00:00';
      this.frPmc = '00:00';

      this.saAmo = '00:00';
      this.saAmc = '00:00';
      this.saPmo = '00:00';
      this.saPmc = '00:00';

      this.suAmo = '00:00';
      this.suAmc = '00:00';
      this.suPmo = '00:00';
      this.suPmc = '00:00';

    }
  }

  // Affichage de la mire de chargment lors de la soumission du formulaire
  displayLoader() {
    this.loader = this.loadingController.create({
      content: `Envoi des horaires en cours...`
    });
    this.loader.present();
  }

  // Envoi du formulaire d'ajout d'un avis
  doSendHours(): void {


    let ttom = (time) => parseInt(time.split(':')[0]) * 60 + parseInt(time.split(':')[1]);

    // Récupération des horaires du formulaire
    let hours = {
      mo: {amo: ttom(this.moAmo), amc: ttom(this.moAmc), pmo: ttom(this.moPmo), pmc: ttom(this.moPmc)},
      tu: {amo: ttom(this.tuAmo), amc: ttom(this.tuAmc), pmo: ttom(this.tuPmo), pmc: ttom(this.tuPmc)},
      we: {amo: ttom(this.weAmo), amc: ttom(this.weAmc), pmo: ttom(this.wePmo), pmc: ttom(this.wePmc)},
      th: {amo: ttom(this.thAmo), amc: ttom(this.thAmc), pmo: ttom(this.thPmo), pmc: ttom(this.thPmc)},
      fr: {amo: ttom(this.frAmo), amc: ttom(this.frAmc), pmo: ttom(this.frPmo), pmc: ttom(this.frPmc)},
      sa: {amo: ttom(this.saAmo), amc: ttom(this.saAmc), pmo: ttom(this.saPmo), pmc: ttom(this.saPmc)},
      su: {amo: ttom(this.suAmo), amc: ttom(this.suAmc), pmo: ttom(this.suPmo), pmc: ttom(this.suPmc)}
    }

    // Si il n'y a pas eu de changement d'horaire, on n'autorise pas la sauvegarde
    if (_.isEqual(this.pharmacie.hours, hours)) {
      let toast = this.toastController.create({
        message: "Veuillez modifier au moins une heure.",
        duration: 3000,
        position: 'middle'
      });
      toast.present();
    } else {

      this.pharmacie.hours = hours;

      // On envoie le formulaire via le provider.
      this.displayLoader();
      let ret = this.pharmaciesProvider
        .patchHours(hours, this.pharmacie._id)
        .subscribe(pharmacie => {
          this.leftEvent.emit('dismiss');
          this.dismiss();
          this.loader.dismiss();
        });
    }
  }

  // Fermeture du formulaire et retour à la page précédente.
  dismiss() {
    this.viewCtrl.dismiss();
  }

}
