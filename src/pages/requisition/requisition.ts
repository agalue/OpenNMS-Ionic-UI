import { Component } from '@angular/core';
import { Keyboard } from '@ionic-native/keyboard';
import { NavController, NavParams, LoadingController, AlertController, ToastController, ActionSheetController } from 'ionic-angular';

import { AbstractPage } from '../abstract-page';
import { ForeignSourcePage } from '../foreign-source/foreign-source';
import { RequisitionNodePage } from '../requisition-node/requisition-node';
import { OnmsRequisition } from '../../models/onms-requisition';
import { OnmsRequisitionNode } from '../../models/onms-requisition-node';
import { OnmsRequisitionsService } from '../../services/onms-requisitions';

@Component({
  selector: 'page-requisition',
  templateUrl: 'requisition.html'
})
export class RequisitionPage extends AbstractPage {

  searchKeyword: string = '';
  requisition: OnmsRequisition;

  constructor(
    loadingCtrl: LoadingController,
    alertCtrl: AlertController,
    toastCtrl: ToastController,
    private keyboard: Keyboard,
    private navCtrl: NavController,
    private navParams: NavParams,
    private actionSheetCtrl: ActionSheetController,
    private requisitionsService: OnmsRequisitionsService
  ) {
    super(loadingCtrl, alertCtrl, toastCtrl);
  }

  ionViewWillLoad() {
    this.requisition = this.navParams.get('requisition');
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
          handler: () => { this.removeNode(node) }
        }
      ]
    });
    alert.present();
  }

  async onEditForeignSourceDefinition() {
    const loading = this.loading(`Loading foreign source definition for requisition ${this.requisition.foreignSource} ...`);
    try {
      let definition = await this.requisitionsService.getForeignSourceDefinition(this.requisition.foreignSource);
      this.navCtrl.push(ForeignSourcePage, { definition: definition });
    } catch (error) {
      this.alert('Load Error', error);
    } finally {
      loading.dismiss();
    }
  }

  onImportRequisition() {
   const actionSheet = this.actionSheetCtrl.create({
      title: `Import Requisition ${this.requisition.foreignSource}`,
      subTitle: 'Do you want to rescan existing nodes ?',
      buttons: [
        {
          text: 'Yes (full sync)',
          handler: () => { this.importRequisition(this.requisition, 'true') }
        },
        {
          text: 'No (skip scan phase)',
          handler: () => { this.importRequisition(this.requisition, 'false') }
        },
        {
          text: 'DB Only (skip scan phase)',
          handler: () => { this.importRequisition(this.requisition, 'dbonly') }
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
          handler: () => { this.deleteRequisition() }
        }
      ]
    });
    alert.present();
  }

  onSearchNodes(event: any) {
    this.searchKeyword = event.target.value;
    setTimeout(() => this.keyboard.close(), 500);
  }

  private async importRequisition(requisition: OnmsRequisition, rescanExisting: string) {
    const loading = this.loading(`Requesting an import of ${requisition.foreignSource}...`);
    try {
      await this.requisitionsService.importRequisition(requisition, rescanExisting);
      this.toast('Import has started!');
    } catch (error) {
      this.alert('Import Error', error);
    } finally {
      loading.dismiss();
    }
  }

  private async deleteRequisition() {
    const loading = this.loading(`Removing requisition ${this.requisition.foreignSource}...`);
    try {
      await this.requisitionsService.removeRequisition(this.requisition);
      this.navCtrl.pop();
    } catch (error) {
      this.alert('Remove Requisition Error', error);
    } finally {
      loading.dismiss();
    }
  }

  private async removeNode(node: OnmsRequisitionNode) {
    const loading = this.loading(`Removing node ${node.foreignId}...`);
    try {
      await this.requisitionsService.removeNode(this.requisition.foreignSource, node);
      this.toast(`Node ${node.foreignId} has been removed!`);
    } catch (error) {
      this.alert('Remove Node Error', error);
    } finally {
      loading.dismiss();
    }
  }

}
