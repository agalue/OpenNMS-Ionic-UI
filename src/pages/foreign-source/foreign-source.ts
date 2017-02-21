import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { NavController, NavParams, ModalController, AlertController, ToastController, reorderArray } from 'ionic-angular';

import { DetectorPage } from '../detector/detector';
import { PolicyPage } from '../policy/policy';
import { OnmsRequisitionDetector } from '../../models/onms-requisition-detector';
import { OnmsRequisitionPolicy } from '../../models/onms-requisition-policy';
import { OnmsForeignSourceConfig } from '../../models/onms-foreign-source-config';
import { OnmsForeignSource } from '../../models/onms-foreign-source';
import { OnmsRequisitionsService } from '../../services/onms-requisitions';

@Component({
  selector: 'page-foreign-source',
  templateUrl: 'foreign-source.html'
})
export class ForeignSourcePage implements OnInit {

  mode = 'overview';
  definition: OnmsForeignSource;
  policiesConfig: OnmsForeignSourceConfig[] = [];
  detectorsConfig: OnmsForeignSourceConfig[] = [];
  reorderPolicies = false;
  reorderDetectors = false;
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
    this.requisitionsService.getPoliciesConfig()
      .then(configs => this.policiesConfig = configs)
      .catch(error => console.error(error));
    this.requisitionsService.getDetectorsConfig()
      .then(configs => this.detectorsConfig = configs)
      .catch(error => console.error(error));
    this.initForm();
  }

  ionViewCanLeave() : Promise<void> {
    if (this.form.valid && !this.form.dirty) {
      return Promise.resolve();
    }
    return new Promise<void>((resolve, reject) => {
      const alert = this.alertCtrl.create({
        title: 'Save Definition',
        subTitle: 'Are you sure you discard all your changes ?',
        message: 'This cannot be undone.',
        buttons: [
          {
            text: 'Save Definition',
            handler: () => {
              this.saveDefinition()
                .then(() => resolve())
                .catch(error => reject(error))
            }
          },
          {
            text: 'Discard Changes',
            handler: () => resolve()
          }
        ]
      });
      alert.present();
    });
  }

  onSave() {
    this.saveDefinition()
      .then(() => this.toast('Foreign Source definition has been saved!'))
      .catch(error => this.alert('Save Definition', error));
  }

  onAddPolicy() {
    this.updatePolicy(null, (newPolicy) => {
      this.definition.policies.push(newPolicy);
      this.toast(`Policy ${newPolicy.name} added!`);
    });
  }

  onAddDetector() {
    this.updateDetector(null, (newDetector) => {
      this.definition.detectors.push(newDetector);
      this.toast(`Detector ${newDetector.name} added!`);
    });
  }

  onEditPolicy(policy: OnmsRequisitionPolicy, index: number) {
    this.updatePolicy(policy, (policyUpdated) => {
      this.definition.policies[index] = policyUpdated;
      this.toast(`Policy ${policyUpdated.name} updated!`);
    });
  }

  onEditDetector(detector: OnmsRequisitionDetector, index: number) {
    this.updateDetector(detector, (detectorUpdated) => {
      this.definition.detectors[index] = detectorUpdated;
      this.toast(`Detector ${detectorUpdated.name} updated!`);
    });
  }

  onEnableReorderPolicies(enable: boolean) {
    this.reorderPolicies = enable;
  }

  onEnableReorderDetectors(enable: boolean) {
    this.reorderDetectors = enable;
  }

  onReorderPolicies(indexes) {
    this.definition.policies = reorderArray(this.definition.policies, indexes);
    this.form.markAsDirty();
  }

  onReorderDetectors(indexes) {
    this.definition.detectors = reorderArray(this.definition.detectors, indexes);
    this.form.markAsDirty();
  }

  private updatePolicy(policy: OnmsRequisitionPolicy, handler: (updated: OnmsRequisitionPolicy) => void) {
    if (!this.policiesConfig) {
      this.alert('Error', 'Cannot find the policies config, try again later.');
      return;
    }
    const modal = this.modalCtrl.create(PolicyPage, { configs: this.policiesConfig, policy: policy });
    modal.onDidDismiss((updatedPolicy:OnmsRequisitionPolicy) => {
      if (updatedPolicy) {
        this.form.markAsDirty();
        handler(updatedPolicy);
      }
    });
    modal.present();
  }

  private updateDetector(detector: OnmsRequisitionDetector, handler: (updated: OnmsRequisitionDetector) => void) {
    if (!this.detectorsConfig) {
      this.alert('Error', 'Cannot find the policies config, try again later.');
      return;
    }
    const modal = this.modalCtrl.create(DetectorPage, { configs: this.detectorsConfig, detector: detector });
    modal.onDidDismiss((updatedDetector:OnmsRequisitionDetector) => {
      if (updatedDetector) {
        this.form.markAsDirty();
        handler(updatedDetector);
      }
    });
    modal.present();
  }

  private initForm() {
    this.form = new FormGroup({
      'scanInterval' : new FormControl(this.definition.scanInterval, Validators.required),
    });
  }

  private saveDefinition() : Promise<void> {
    return new Promise<void>((resolve,reject) => {
      Object.assign(this.definition, this.form.value);
      this.requisitionsService.saveForeignSourceDefinition(this.definition)
        .then(() => {
          this.form.markAsPristine();
          resolve();
        })
        .catch(error => reject(error));
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
