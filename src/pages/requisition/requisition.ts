import { Component } from '@angular/core';
import { NavController, NavParams, LoadingController, AlertController, ToastController, ActionSheetController } from 'ionic-angular';

import { ForeignSourcePage } from '../foreign-source/foreign-source';
import { RequisitionNodePage } from '../requisition-node/requisition-node';
import { OnmsRequisition } from '../../models/onms-requisition';
import { OnmsRequisitionNode } from '../../models/onms-requisition-node';
import { OnmsForeignSource } from '../../models/onms-foreign-source';
import { OnmsRequisitionsService } from '../../services/onms-requisitions';

@Component({
  selector: 'page-requisition',
  templateUrl: 'requisition.html'
})
export class RequisitionPage {

  requisition: OnmsRequisition;

  constructor(
    private navCtrl: NavController,
    private navParams: NavParams,
    private loadingCtrl: LoadingController,
    private alertCtrl: AlertController,
    private toastCtrl: ToastController,
    private actionSheetCtrl: ActionSheetController,
    private requisitionsService: OnmsRequisitionsService
  ) {
    this.requisition = navParams.get('requisition');
  }

  onShowOptions() {
    const actionSheet = this.actionSheetCtrl.create({
      title: 'Requisition Commands',
      buttons: [
        {
          text: 'Add Node',
          handler: () => this.onAddNode()
        },
        {
          text: 'Edit Foreign Source Definition',
          handler: () => this.onEditForeignSourceDefinition()
        },
        {
          text: 'Import / Synchronize',
          handler: () => this.onImportRequisition()
        },
        {
          text: 'Cancel',
          role: 'cancel'
        }
      ]
    });
    actionSheet.present();
  }

  onSearch() {

  }

  onCancelSearch() {

  }

  onAddNode() {
    this.navCtrl.push(RequisitionNodePage, { foreignSource: this.requisition.foreignSource })
  }

  onEditNode(node: OnmsRequisitionNode) {
    this.navCtrl.push(RequisitionNodePage, { foreignSource: this.requisition.foreignSource, node: node })
  }

  onRemoveNode() {

  }

  onEditForeignSourceDefinition() {
    this.navCtrl.push(ForeignSourcePage, {})
  }

  onImportRequisition() {
   const actionSheet = this.actionSheetCtrl.create({
      title: `Import Requisition ${this.requisition.foreignSource}`,
      subTitle: 'Do you want to rescan existing nodes ?',
      buttons: [
        {
          text: 'Yes (full sync)',
          handler: () => this.importRequisition(this.requisition, 'true')
        },
        {
          text: 'No (skip scan phase)',
          handler: () => this.importRequisition(this.requisition, 'false')
        },
        {
          text: 'DB Only (skip scan phase)',
          handler: () => this.importRequisition(this.requisition, 'dbonly')
        },
        {
          text: 'Cancel',
          role: 'cancel'
        }
      ]
    });
    actionSheet.present();
  }

  private importRequisition(requisition: OnmsRequisition, rescanExisting: string) {
    const loading = this.loadingCtrl.create({
      content: `Requesting an import of ${requisition.foreignSource}...`
    });
    loading.present();
    this.requisitionsService.importRequisition(requisition.foreignSource, rescanExisting)
      .then(() => {
        loading.dismiss();
        this.toast('Import has started!');
      })
      .catch(error => {
        loading.dismiss();
        this.alert('Import Error', error)
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
