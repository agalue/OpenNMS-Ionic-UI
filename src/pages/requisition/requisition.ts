import { Component } from '@angular/core';
import { Keyboard } from 'ionic-native';
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

  searchKeyword: string = '';
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
          text: 'Remove Requisition',
          handler: () => this.onRemoveRequisition()
        },
        {
          text: 'Cancel',
          role: 'cancel'
        }
      ]
    });
    actionSheet.present();
  }

  onAddNode() {
    let foreignIds: string[] = this.requisition.nodes.map(n => n.foreignId);
    this.navCtrl.push(RequisitionNodePage, {
      foreignSource: this.requisition.foreignSource,
      foreignIds: foreignIds
    })
  }

  onEditNode(node: OnmsRequisitionNode) {
    this.navCtrl.push(RequisitionNodePage, {
      foreignSource: this.requisition.foreignSource,
      node: node
    })
  }

  onRemoveNode(node: OnmsRequisitionNode) {
    const alert = this.alertCtrl.create({
      title: 'Delete Node',
      subTitle: 'Are you sure you want to delete the node?',
      message: 'This cannot be undone. All the nodes will be permanently removed from the database.',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel'
        },
        {
          text: 'Delete',
          handler: () => this.removeNode(node)
        }
      ]
    });
    alert.present();
  }

  onEditForeignSourceDefinition() {
    const loading = this.loadingCtrl.create({
      content: `Loading foreign source definition for requisition ${this.requisition.foreignSource} ...`
    });
    loading.present();
    return this.requisitionsService.getForeignSourceDefinition(this.requisition.foreignSource)
      .then((definition:OnmsForeignSource) => {
        loading.dismiss();
        this.navCtrl.push(ForeignSourcePage, { definition: definition });
      })
      .catch(error => {
        loading.dismiss();
        this.alert('Load Error', error)
      });
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

  onRemoveRequisition() {
    const alert = this.alertCtrl.create({
      title: 'Delete Requisition',
      subTitle: `Are you sure you want to delete the requisition ${this.requisition.foreignSource} ?`,
      message: 'This cannot be undone. All the nodes will be permanently removed from the database.',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel'
        },
        {
          text: 'Delete',
          handler: () => this.deleteRequisition()
        }
      ]
    });
    alert.present();
  }

  onSearchNodes(event: any) {
    this.searchKeyword = event.target.value;
    setTimeout(() => Keyboard.close(), 500);
  }

  private importRequisition(requisition: OnmsRequisition, rescanExisting: string) {
    const loading = this.loadingCtrl.create({
      content: `Requesting an import of ${requisition.foreignSource}...`
    });
    loading.present();
    this.requisitionsService.importRequisition(requisition, rescanExisting)
      .then(() => {
        loading.dismiss();
        this.toast('Import has started!');
      })
      .catch(error => {
        loading.dismiss();
        this.alert('Import Error', error)
      });
  }

  private deleteRequisition() {
    const loading = this.loadingCtrl.create({
      content: `Removing requisition ${this.requisition.foreignSource}...`
    });
    loading.present();
    this.requisitionsService.removeRequisition(this.requisition)
      .then(() => {
        loading.dismiss();
        this.navCtrl.pop();
      })
    .catch(error => {
      loading.dismiss();
      this.alert('Remove Requisition Error', error)
    });
  }

  private removeNode(node: OnmsRequisitionNode) {
    const loading = this.loadingCtrl.create({
      content: `Removing node ${node.foreignId}...`
    });
    loading.present();
    this.requisitionsService.removeNode(this.requisition.foreignSource, node)
      .then(() => {
        loading.dismiss();
        this.toast(`Node ${node.foreignId} has been removed!`);
      })
    .catch(error => {
      loading.dismiss();
      this.alert('Remove Node Error', error)
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
