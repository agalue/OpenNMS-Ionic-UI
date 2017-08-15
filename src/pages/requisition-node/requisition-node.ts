import { Component } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { NavParams, ModalController, LoadingController, AlertController, ToastController } from 'ionic-angular';

import { AbstractPage } from '../abstract-page';
import { RequisitionInterfacePage } from '../requisition-interface/requisition-interface';
import { RequisitionAssetPage } from '../requisition-asset/requisition-asset';
import { RequisitionCategoryPage } from '../requisition-category/requisition-category';
import { OnmsRequisitionNode } from '../../models/onms-requisition-node';
import { OnmsRequisitionInterface } from '../../models/onms-requisition-interface';
import { OnmsRequisitionAsset } from '../../models/onms-requisition-asset';
import { OnmsRequisitionCategory } from '../../models/onms-requisition-category';
import { OnmsRequisitionsService } from '../../services/onms-requisitions';
import { OnmsServersService, OnmsFeatures } from '../../services/onms-servers';

import { validateUnique } from '../../directives/unique';

@Component({
  selector: 'page-requisition-node',
  templateUrl: 'requisition-node.html'
})
export class RequisitionNodePage extends AbstractPage {

  isNew: boolean = false;
  mode: string = 'basic';
  foreignSource: string;
  foreignIds: string[];
  locations: string[];
  node: OnmsRequisitionNode;
  form: FormGroup;

  constructor(
    loadingCtrl: LoadingController,
    alertCtrl: AlertController,
    toastCtrl: ToastController,
    private navParams: NavParams,
    private modalCtrl: ModalController,
    private serversService: OnmsServersService,
    private requisitionsService: OnmsRequisitionsService
  ) {
    super(loadingCtrl, alertCtrl, toastCtrl);
  }

  ionViewWillLoad() {
    this.foreignSource = this.navParams.get('foreignSource');
    this.foreignIds = this.navParams.get('foreignIds') || [];
    this.node = this.navParams.get('node');
    if (this.node == null) {
      this.isNew = true;
      this.node = OnmsRequisitionNode.create();
    }
    this.initialize();
  }

  ionViewCanLeave() : Promise<boolean> {
    if (this.form.valid && !this.form.dirty) {
      return Promise.resolve(true);
    }
    return new Promise<boolean>((resolve, reject) => {
      const alert = this.alertCtrl.create({
        title: 'Save requisition before leaving',
        subTitle: 'Are you sure you discard all your changes ?',
        message: 'This cannot be undone.',
        buttons: [
          {
            text: 'Save Node',
            handler: async() => {
              try {
                await this.saveNode();
                resolve(true);
              } catch (error) {
                this.alert('Save Node', error);
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
      await this.saveNode();
    } catch (error) {
      this.alert('Save Node', error);
    }
  }

  onGenerateForeignId() {
    this.form.get('foreignId').setValue(new Date().getTime());
  }

  onAddInterface() {
    this.updateInterface(null, (newIntf) => {
      this.node.interfaces.push(newIntf);
      this.toast(`Interface ${newIntf.ipAddress} added!`);
    });    
  }

  onAddAsset() {
    this.updateAsset(null, (newAsset) => {
      this.node.assets.push(newAsset);
      this.toast(`Asset ${newAsset.name} added!`);
    });
  }

  onAddCategory() {
    this.updateCategory(null, (newCategory) => {
      this.node.categories.push(newCategory);
      this.toast(`Category ${newCategory.name} added!`);
    });
  }

  onEditInterface(intf: OnmsRequisitionInterface, index: number) {
    this.updateInterface(intf, (intfUpdated) => {
      this.node.interfaces[index] = intfUpdated;
      this.toast(`Interface ${intfUpdated.ipAddress} updated!`);
    });    
  }

  onEditAsset(asset: OnmsRequisitionAsset, index: number) {
    this.updateAsset(asset, (updatedAsset) => {
      this.node.assets[index] = updatedAsset;
      this.toast(`Asset ${updatedAsset.name} updated!`);
    });
  }

  onEditCategory(category: OnmsRequisitionCategory, index: number) {
    this.updateCategory(category, (updatedCategory) => {
      this.node.categories[index] = updatedCategory;
      this.toast(`Category ${updatedCategory.name} updated!`);
    });
  }

  onRemoveInterface(index: number) {
    this.node.interfaces.splice(index, 1);
    this.form.markAsDirty();
  }

  onRemoveAsset(index: number) {
    this.node.assets.splice(index, 1);
    this.form.markAsDirty();
  }

  onRemoveCategory(index: number) {
    this.node.categories.splice(index, 1);
    this.form.markAsDirty();
  }

  isMinionSupported() : boolean {
    return this.serversService.supports(OnmsFeatures.Minion);
  }

  private async initialize() {
    try {
      this.locations = await this.requisitionsService.getAvailableLocations();
      this.initForm();
    } catch (error) {
      this.alert('Load Locations', error);
    }
  }

  private async saveNode() : Promise<void> {
    OnmsRequisitionNode.assign(this.node, this.form.value);
    await this.requisitionsService.saveNode(this.foreignSource, this.node)
    this.form.markAsPristine();
    this.form.markAsUntouched();
    this.isNew = false;
    this.toast('Node has been saved!');
  }

  private updateInterface(intf: OnmsRequisitionInterface, handler: (updated: OnmsRequisitionInterface) => void) {
    const modal = this.modalCtrl.create(RequisitionInterfacePage, {
      intf: intf,
      blacklist: this.node.interfaces.map(i => i.ipAddress),
      foreignSource: this.foreignSource,
    });
    modal.onDidDismiss((updatedIntf:OnmsRequisitionInterface) => {
      if (updatedIntf) {
        this.form.markAsDirty();
        handler(updatedIntf);
      }
    });
    modal.present();
  }

  private updateAsset(asset: OnmsRequisitionAsset, handler: (updated: OnmsRequisitionAsset) => void) {
    const modal = this.modalCtrl.create(RequisitionAssetPage, {
      asset: asset,
      blacklist: this.node.assets.map(a => a.name)
    });
    modal.onDidDismiss((updatedAsset: OnmsRequisitionAsset) => {
      if (updatedAsset) {
        this.form.markAsDirty();
        handler(updatedAsset);
      }
    });
    modal.present();
  }

  private updateCategory(category: OnmsRequisitionCategory, handler: (updated: OnmsRequisitionCategory) => void) {
    const modal = this.modalCtrl.create(RequisitionCategoryPage, {
      category: category,
      blacklist: this.node.categories.map(c => c.name)
    });
    modal.onDidDismiss((updatedCategory: OnmsRequisitionCategory) => {
      if (updatedCategory) {
        this.form.markAsDirty();
        handler(updatedCategory);
      }
    });
    modal.present();
  }

  private initForm() {
    this.form = new FormGroup({
      'foreignId' : new FormControl({ value: this.node.foreignId, disabled: !this.isNew || this.node.deployed }, [Validators.required, validateUnique(this.foreignIds)]),
      'nodeLabel' : new FormControl(this.node.nodeLabel, Validators.required),
      'location' : new FormControl(this.node.location),
      'building' : new FormControl(this.node.building),
      'city' : new FormControl(this.node.city),
      'parentForeignSource' : new FormControl(this.node.parentForeignSource),
      'parentForeignId' : new FormControl(this.node.parentForeignId),
      'parentNodeLabel' : new FormControl(this.node.parentNodeLabel)
    });
  }

}
