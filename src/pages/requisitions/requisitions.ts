import { Component } from '@angular/core';
import { NavController, NavParams, LoadingController, AlertController, ToastController, ActionSheetController } from 'ionic-angular';

import { ForeignSourcePage } from '../foreign-source/foreign-source';
import { RequisitionPage } from '../requisition/requisition';
import { OnmsRequisition } from '../../models/onms-requisition';
import { OnmsForeignSource } from '../../models/onms-foreign-source';
import { OnmsRequisitionsService } from '../../services/onms-requisitions';

@Component({
  selector: 'page-requisitions',
  templateUrl: 'requisitions.html'
})
export class RequisitionsPage {

  noRequisitions = false;
  searchKeyword: string = '';
  requisitions: OnmsRequisition[] = [];

  constructor(
    private navCtrl: NavController,
    private navParams: NavParams,
    private loadingCtrl: LoadingController,
    private alertCtrl: AlertController,
    private toastCtrl: ToastController,    
    private actionSheetCtrl: ActionSheetController,
    private requisitionsService: OnmsRequisitionsService
  ) {}

  ionViewWillLoad() {
    this.onRefresh();
  }

  onRefresh() {
    const loading = this.loadingCtrl.create({
      content: 'Loading requisitions. This could take a while, please wait...'
    });
    loading.present();
    this.requisitions = [];
    this.requisitionsService.getRequisitions()
      .then((requisitions: OnmsRequisition[]) => {
        this.requisitions = requisitions;
        this.noRequisitions = requisitions.length == 0;
        loading.dismiss();
      })
      .catch(error => {
        loading.dismiss();
        this.alert('Load Error', error)
      });
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
          handler: () => this.onRefresh()
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
          handler: data => this.addRequisition(data.name)
        }
      ]
    });
    alert.present();
  }

  onEditForeignSource(foreignSource: string) {
    const content = foreignSource == 'default' ?
      'Loading defult foreign source definition...' :
      `Loading foreign source definition for requisition ${foreignSource} ...`
    const loading = this.loadingCtrl.create({ content: content });
    loading.present();
    return this.requisitionsService.getForeignSourceDefinition(foreignSource)
      .then((definition:OnmsForeignSource) => {
        loading.dismiss();
        this.navCtrl.push(ForeignSourcePage, { definition: definition });
      })
      .catch(error => {
        loading.dismiss();
        this.alert('Load Error', error)
      });
  }

  onImportRequisition(requisition: OnmsRequisition) {
   const actionSheet = this.actionSheetCtrl.create({
      title: `Import Requisition ${requisition.foreignSource}`,
      subTitle: 'Do you want to rescan existing nodes ?',
      buttons: [
        {
          text: 'Yes (full sync)',
          handler: () => this.importRequisition(requisition, 'true')
        },
        {
          text: 'No (skip scan phase)',
          handler: () => this.importRequisition(requisition, 'false')
        },
        {
          text: 'DB Only (skip scan phase)',
          handler: () => this.importRequisition(requisition, 'dbonly')
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
          handler: () => this.deleteRequisition(requisition)
        }
      ]
    });
    alert.present();
  }

  private addRequisition(foreignSource: string) {
    if (this.requisitions.find(r => r.foreignSource == foreignSource)) {
      this.alert('Add Requisition', `There is a requisition called ${foreignSource}, please use a different name`);
    } else {
      const loading = this.loadingCtrl.create({
        content: `Creating requisition ${foreignSource}...`
      });
      loading.present();      
      const requisition = OnmsRequisition.create(foreignSource);
      this.requisitionsService.saveRequisition(requisition)
        .then(() => {
          loading.dismiss();
          this.onShowRequisition(requisition);
        })
      .catch(error => {
        loading.dismiss();
        this.alert('Add Requisition Error', error)
      });
    }
  }

  private deleteRequisition(requisition: OnmsRequisition) {
    const loading = this.loadingCtrl.create({
      content: `Removing requisition ${requisition.foreignSource}...`
    });
    loading.present();
    this.requisitionsService.removeRequisition(requisition)
      .then(() => {
        loading.dismiss();
        let index = this.requisitions.findIndex(r => r.foreignSource == requisition.foreignSource);
        this.requisitions.splice(index, 1);
        this.toast(`Requisition ${requisition.foreignSource} has been removed!`);
      })
    .catch(error => {
      loading.dismiss();
      this.alert('Remove Requisition Error', error)
    });
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
