import { Component } from '@angular/core';
import { NgForm } from '@angular/forms';
import { NavController, NavParams, AlertController, LoadingController, ToastController } from 'ionic-angular';

import { AbstractPage } from '../abstract-page';
import { OnmsNode } from '../../models/onms-node';
import { OnmsRequisitionAsset } from '../../models/onms-requisition-asset';
import { OnmsAssetConfig, OnmsAssetConfigGroups } from '../../models/onms-asset-config';
import { OnmsNodesService } from '../../services/onms-nodes';
import { OnmsRequisitionsService } from '../../services/onms-requisitions';

@Component({
  selector: 'page-assets',
  templateUrl: 'assets.html'
})
export class AssetsPage extends AbstractPage {

  node: OnmsNode;
  configGroups: OnmsAssetConfig[] = OnmsAssetConfigGroups;

  constructor(
    loadingCtrl: LoadingController,
    alertCtrl: AlertController,
    toastCtrl: ToastController,
    private navCtrl: NavController,
    private navParams: NavParams,
    private nodesService: OnmsNodesService,
    private requisitionsService: OnmsRequisitionsService
  ) {
    super(loadingCtrl, alertCtrl, toastCtrl);
  }

  ionViewWillLoad() {
    this.node = this.navParams.get('node');
  }

  async onSave(form: NgForm) {
    const loading = this.loading(`Saving assets for ${this.node.label} ...`);
    try {
      await this.nodesService.updateAssets(this.node.id, this.node.assetRecord)
      this.toast('Assets has been updated successfully!');
      this.onUpdateRequisition();
    } catch (error) {
      loading.dismiss();
    } finally {
      loading.dismiss();
    }
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
            handler: () => { this.updateRequisition() }
          }
        ]
      });
      alert.present();
    }
  }

  private async updateRequisition() {
    const loading = this.loading(`Saving assets on requisition ${this.node.foreignSource} ...`);
    try {
      let assets = OnmsRequisitionAsset.importAll(this.node.assetRecord);
      await this.requisitionsService.updateAssets(this.node.foreignSource, this.node.foreignId, assets);
      this.toast(`Requisition ${this.node.foreignSource} updated!`);
    } catch (error) {
      this.alert('Update Error', error);
    } finally {
      loading.dismiss();
    }
  }

}
