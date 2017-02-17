import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { NavController, NavParams, ModalController, AlertController, ToastController } from 'ionic-angular';

import { DetectorPage } from '../detector/detector';
import { PolicyPage } from '../policy/policy';
import { OnmsRequisitionDetector } from '../../models/onms-requisition-detector';
import { OnmsRequisitionPolicy } from '../../models/onms-requisition-policy';
import { OnmsForeignSource } from '../../models/onms-foreign-source';
import { OnmsRequisitionsService } from '../../services/onms-requisitions';

@Component({
  selector: 'page-foreign-source',
  templateUrl: 'foreign-source.html'
})
export class ForeignSourcePage implements OnInit {

  mode = 'overview';
  definition: OnmsForeignSource;
  form: FormGroup;

  constructor(
    private navCtrl: NavController,
    private navParams: NavParams,
    private modalCtrl: ModalController,    
    private alertCtrl: AlertController,
    private toastCtrl: ToastController,    
    private requisitionsService: OnmsRequisitionsService
  ) {}

  ngOnInit() {
    this.definition = this.navParams.get('definition');
    this.initForm();
  }

  onShowDetector(detector: OnmsRequisitionDetector) {
    const modal = this.modalCtrl.create(DetectorPage, { detector: detector });
    modal.onDidDismiss((updatedDetector: OnmsRequisitionDetector) => {
      if (updatedDetector) {
        // Perform Validation and mark the form as dirty if changed.
      }
    });
    modal.present();
  }

  onShowPolicy(policy: OnmsRequisitionPolicy) {
    const modal = this.modalCtrl.create(PolicyPage, { policy: policy });
    modal.onDidDismiss((updatedPolicy: OnmsRequisitionPolicy) => {
      if (updatedPolicy) {
        // Perform Validation and mark the form as dirty if changed.
      }
    });
    modal.present();    
  }

  private initForm() {
    console.log('initialize form');
    this.form = new FormGroup({
      'scanInterval' : new FormControl(this.definition.scanInterval, Validators.required),
    });
  }

  private alert(title: string, message: string) {
    const alert = this.alertCtrl.create({
      title: title,
      message: message,
      buttons: ['Ok']
    });
    alert.present();
  }

  private toast(message: string) {
    const alert = this.toastCtrl.create({
      message: message,
      duration: 2000,
      position: 'bottom'
    });
    alert.present();
  }

}
