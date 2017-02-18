import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { NavParams, ModalController, AlertController, ToastController } from 'ionic-angular';

import { RequisitionInterfacePage } from '../requisition-interface/requisition-interface';
import { RequisitionAssetPage } from '../requisition-asset/requisition-asset';
import { RequisitionCategoryPage } from '../requisition-category/requisition-category';
import { OnmsRequisitionNode } from '../../models/onms-requisition-node';
import { OnmsRequisitionInterface } from '../../models/onms-requisition-interface';
import { OnmsRequisitionAsset } from '../../models/onms-requisition-asset';
import { OnmsRequisitionCategory } from '../../models/onms-requisition-category';
import { OnmsRequisitionsService } from '../../services/onms-requisitions';

@Component({
  selector: 'page-requisition-node',
  templateUrl: 'requisition-node.html'
})
export class RequisitionNodePage implements OnInit {

  isNew: boolean = false;
  mode: string = 'basic';
  foreignSource: string;
  node: OnmsRequisitionNode;
  form: FormGroup;

  constructor(
    private navParams: NavParams,
    private modalCtrl: ModalController,
    private alertCtrl: AlertController,
    private toastCtrl: ToastController,
    private requisitionsService: OnmsRequisitionsService
  ) {}

  ngOnInit() {
    this.foreignSource = this.navParams.get('foreignSource');
    this.node = this.navParams.get('node');
    if (this.node == null) {
      this.isNew = true;
      this.node = OnmsRequisitionNode.create();
    }
    this.initForm();
  }

  ionViewCanLeave() : Promise<void> {
    if (this.form.valid && !this.form.dirty) {
      return Promise.resolve();
    }
    return new Promise<void>((resolve, reject) => {
      const alert = this.alertCtrl.create({
        title: 'Save Requisition',
        subTitle: 'Are you sure you discard all your changes ?',
        message: 'This cannot be undone.',
        buttons: [
          {
            text: 'Save Node',
            handler: () => {
              this.saveNode()
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
    this.saveNode()
      .then(() => this.toast('Node has been saved!'))
      .catch(error => this.alert('Save Node', error));
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

  private saveNode() : Promise<void> {
    return new Promise<void>((resolve,reject) => {
      Object.assign(this.node, this.form.value);
      this.requisitionsService.saveNode(this.foreignSource, this.node)
        .then(() => {
          this.form.markAsPristine();
          resolve();
        })
        .catch(error => reject(error));
    });
  }

  private updateInterface(intf: OnmsRequisitionInterface, handler: (updated: OnmsRequisitionInterface) => void) {
    const modal = this.modalCtrl.create(RequisitionInterfacePage, { foreignSource: this.foreignSource, intf: intf });
    modal.onDidDismiss((updatedIntf:OnmsRequisitionInterface) => {
      if (updatedIntf) {
        this.form.markAsDirty();
        handler(updatedIntf);
      }
    });
    modal.present();
  }

  private updateAsset(asset: OnmsRequisitionAsset, handler: (updated: OnmsRequisitionAsset) => void) {
    const modal = this.modalCtrl.create(RequisitionAssetPage, { asset: asset });
    modal.onDidDismiss((updatedAsset: OnmsRequisitionAsset) => {
      if (updatedAsset) {
        this.form.markAsDirty();
        handler(updatedAsset);
      }
    });
    modal.present();
  }

  private updateCategory(category: OnmsRequisitionCategory, handler: (updated: OnmsRequisitionCategory) => void) {
    const modal = this.modalCtrl.create(RequisitionCategoryPage, { category: category });
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
      'foreignId' : new FormControl(this.node.foreignId, Validators.required),
      'nodeLabel' : new FormControl(this.node.nodeLabel, Validators.required),
      'location' : new FormControl(this.node.location),
      'building' : new FormControl(this.node.building),
      'city' : new FormControl(this.node.city),
      'parentForeignSource' : new FormControl(this.node.parentForeignSource),
      'parentForeignId' : new FormControl(this.node.parentForeignId),
      'parentNodeLabel' : new FormControl(this.node.parentNodeLabel)
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
