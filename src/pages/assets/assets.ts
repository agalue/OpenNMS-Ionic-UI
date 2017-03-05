import { Component } from '@angular/core';
import { NgForm } from '@angular/forms';
import { NavController, NavParams, AlertController, LoadingController, ToastController } from 'ionic-angular';

import { OnmsNode } from '../../models/onms-node';
import { OnmsRequisitionAsset } from '../../models/onms-requisition-asset';
import { OnmsAssetConfig, OnmsAssetConfigGroups } from '../../models/onms-asset-config';
import { OnmsNodesService } from '../../services/onms-nodes';
import { OnmsRequisitionsService } from '../../services/onms-requisitions';

@Component({
  selector: 'page-assets',
  templateUrl: 'assets.html'
})
export class AssetsPage {

  node: OnmsNode;
  configGroups: OnmsAssetConfig[] = OnmsAssetConfigGroups;

  constructor(
    private navCtrl: NavController,
    private navParams: NavParams,
    private alertCtrl: AlertController,
    private loadingCtrl: LoadingController,
    private toastCtrl: ToastController,
    private nodesService: OnmsNodesService,
    private requisitionsService: OnmsRequisitionsService
  ) {
    this.node = navParams.get('node');
  }

  onSave(form: NgForm) {
    const loading = this.loadingCtrl.create({
      content: `Saving assets for ${this.node.label} ...`
    });
    loading.present();
    this.nodesService.updateAssets(this.node.id, this.node.assetRecord)
      .then(() => {
        loading.dismiss();
        this.toast('Assets has been updated successfully!');
        this.onUpdateRequisition();
      })
      .catch(error => {
        loading.dismiss();
        this.alert('Save Error', error);
      });
  }

  onUpdateRequisition() {
    if (this.node.foreignSource && this.node.foreignId) {
      const alert = this.alertCtrl.create({
        title: 'Update Requisition',
        subTitle: `Do you want to save the assets for node ${this.node.label} requisition ${this.node.foreignSource} ?`,
        message: 'Next time the requisition is synchronized, your changes will be persisted.',
        buttons: [
          {
            text: 'Cancel',
            role: 'cancel'
          },
          {
            text: 'Update Requisition',
            handler: () => this.updateRequisition()
          }
        ]
      });
      alert.present();
    }
  }

  private updateRequisition() {
    const loading = this.loadingCtrl.create({
      content: `Saving assets on requisition ${this.node.foreignSource} ...`
    });
    loading.present();
    let assets = OnmsRequisitionAsset.importAll(this.node.assetRecord);
    this.requisitionsService.updateAssets(this.node.foreignSource, this.node.foreignId, assets)
      .then(() => {
        loading.dismiss();
        this.toast(`Requisition ${this.node.foreignSource} updated!`);
      })
      .catch(error => {
        loading.dismiss();
        this.alert('Update Error', error);
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
    const toast = this.toastCtrl.create({
      message: message,
      duration: 2000,
      position: 'bottom'
    });
    toast.present();
  }

}
