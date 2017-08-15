import { Component } from '@angular/core';
import { Keyboard } from '@ionic-native/keyboard';
import { NavController, NavParams, LoadingController, AlertController, ToastController, ActionSheetController } from 'ionic-angular';

import { AbstractPage } from '../abstract-page';
import { ForeignSourcePage } from '../foreign-source/foreign-source';
import { RequisitionPage } from '../requisition/requisition';
import { OnmsRequisition } from '../../models/onms-requisition';
import { OnmsRequisitionsService } from '../../services/onms-requisitions';

@Component({
  selector: 'page-requisitions',
  templateUrl: 'requisitions.html'
})
export class RequisitionsPage extends AbstractPage {

  noRequisitions = false;
  searchKeyword: string = '';
  requisitions: OnmsRequisition[] = [];

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
    this.onRefresh();
  }

  async onRefresh(force: boolean = false) {
    const loading = this.loading('Loading requisitions. This could take a while, please wait...');
    this.requisitions = [];
    try {
      this.requisitions = await this.requisitionsService.getRequisitions(force);
      this.noRequisitions = this.requisitions.length == 0;
    } catch (error) {
      this.alert('Load Error', error);
    } finally {
      loading.dismiss();
    }
  }

  onShowOptions() {
   const actionSheet = this.actionSheetCtrl.create({
      title: 'Requisitions Commands',
      buttons: [
        {
          text: 'Add Requisition',
          handler: () => this.onAddRequisition()
        },
        {
          text: 'Edit Default Foreign Source',
          handler: () => this.onEditForeignSource('default')
        },
        {
          text: 'Refresh Requisitions',
          handler: () => this.onRefresh(true)
        },
        {
          text: 'Cancel',
          role: 'cancel'
        }
      ]
    });
    actionSheet.present();
  }

  onShowRequisition(requisition: OnmsRequisition) {
    this.navCtrl.push(RequisitionPage, { requisition: requisition });
  }

  onAddRequisition() {
    const alert = this.alertCtrl.create({
      title: 'Add Requisition',
      inputs: [
        {
          name: 'name',
          placeholder: 'Name'
        }
      ],
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel'
        },
        {
          text: 'Add',
          handler: data => { this.addRequisition(data.name) }
        }
      ]
    });
    alert.present();
  }

  async onEditForeignSource(foreignSource: string) {
    const content = foreignSource == 'default' ?
      'Loading defult foreign source definition...' :
      `Loading foreign source definition for requisition ${foreignSource} ...`;
    const loading = this.loading(content);
    try {
      const definition = await this.requisitionsService.getForeignSourceDefinition(foreignSource);
      this.navCtrl.push(ForeignSourcePage, { definition: definition });
    } catch (error) {
      this.alert('Load Error', error);
    } finally {
      loading.dismiss();
    }
  }

  onImportRequisition(requisition: OnmsRequisition) {
   const actionSheet = this.actionSheetCtrl.create({
      title: `Import Requisition ${requisition.foreignSource}`,
      subTitle: 'Do you want to rescan existing nodes ?',
      buttons: [
        {
          text: 'Yes (full sync)',
          handler: () => { this.importRequisition(requisition, 'true') }
        },
        {
          text: 'No (skip scan phase)',
          handler: () => { this.importRequisition(requisition, 'false') }
        },
        {
          text: 'DB Only (skip scan phase)',
          handler: () => { this.importRequisition(requisition, 'dbonly') }
        },
        {
          text: 'Cancel',
          role: 'cancel'
        }
      ]
    });
    actionSheet.present();
  }

  onDeleteRequisition(requisition: OnmsRequisition) {
    const alert = this.alertCtrl.create({
      title: 'Delete Requisition',
      subTitle: `Are you sure you want to delete the requisition ${requisition.foreignSource} ?`,
      message: 'This cannot be undone. All the nodes will be permanently removed from the database.',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel'
        },
        {
          text: 'Delete',
          handler: () => { this.deleteRequisition(requisition) }
        }
      ]
    });
    alert.present();
  }

  onSearchRequisitions(event: any) {
    this.searchKeyword = event.target.value;
    setTimeout(() => this.keyboard.close(), 500);
  }

  private async addRequisition(foreignSource: string) {
    if (this.requisitions.find(r => r.foreignSource == foreignSource)) {
      this.alert('Add Requisition', `There is a requisition called ${foreignSource}, please use a different name`);
    } else {
      const loading = this.loading(`Creating requisition ${foreignSource}...`);
      try {
        const requisition = OnmsRequisition.create(foreignSource);
        await this.requisitionsService.saveRequisition(requisition);
        this.onShowRequisition(requisition);
      } catch (error) {
        this.alert('Add Requisition Error', error);
      } finally {
        loading.dismiss();
      }
    }
  }

  private async deleteRequisition(requisition: OnmsRequisition) {
    const loading = this.loading(`Removing requisition ${requisition.foreignSource}...`);
    try {
      await this.requisitionsService.removeRequisition(requisition);
      let index = this.requisitions.findIndex(r => r.foreignSource == requisition.foreignSource);
      this.requisitions.splice(index, 1);
      this.toast(`Requisition ${requisition.foreignSource} has been removed!`);
    } catch (error) {
      this.alert('Remove Requisition Error', error);
    } finally {
      loading.dismiss();
    }
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

}
