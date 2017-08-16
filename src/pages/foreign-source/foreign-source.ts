import { Component } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { NavController, NavParams, ModalController, LoadingController, AlertController, ToastController, reorderArray } from 'ionic-angular';

import { AbstractPage } from '../abstract-page';
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
export class ForeignSourcePage extends AbstractPage {

  mode = 'overview';
  definition: OnmsForeignSource;
  policiesConfig: OnmsForeignSourceConfig[] = [];
  detectorsConfig: OnmsForeignSourceConfig[] = [];
  reorderPolicies = false;
  reorderDetectors = false;
  form: FormGroup;

  constructor(
    loadingCtrl: LoadingController,
    alertCtrl: AlertController,
    toastCtrl: ToastController,
    private navCtrl: NavController,
    private navParams: NavParams,
    private modalCtrl: ModalController,    
    private requisitionsService: OnmsRequisitionsService
  ) {
    super(loadingCtrl, alertCtrl, toastCtrl);
  }

  ionViewWillLoad() {
    this.definition = this.navParams.get('definition');
    this.initializeConfig();
    this.initForm();
  }

  ionViewCanLeave() : Promise<boolean> {
    if (this.form.valid && !this.form.dirty) {
      return Promise.resolve(true);
    }
    return new Promise<boolean>((resolve, reject) => {
      const alert = this.alertCtrl.create({
        title: 'Save Definition',
        subTitle: 'Are you sure you discard all your changes ?',
        message: 'This cannot be undone.',
        buttons: [
          {
            text: 'Save Definition',
            handler: async() => {
              try {
                await this.saveDefinition();
                resolve(true);
              } catch (error) {
                this.alert('Save Definition', error);
                reject(error);
              }
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

  async onSave() {
    try {
      await this.saveDefinition();
    } catch (error) {
      this.alert('Save Definition', error);
    }
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

  onRemoveDetector(index: number) {
    this.definition.detectors.splice(index, 1);
    this.form.markAsDirty();
  }

  onRemovePolicy(index: number) {
    this.definition.policies.splice(index, 1);
    this.form.markAsDirty();
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

  private async initializeConfig() {
    try {
      this.policiesConfig = await this.requisitionsService.getPoliciesConfig();
      this.detectorsConfig = await this.requisitionsService.getDetectorsConfig();
    } catch (error) {
      this.alert('Config Error', error);
    }
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

  private async saveDefinition() : Promise<void> {
    Object.assign(this.definition, this.form.value);
    await this.requisitionsService.saveForeignSourceDefinition(this.definition)
    this.form.markAsPristine();
    this.toast('Foreign Source definition has been saved!');
  }

}
