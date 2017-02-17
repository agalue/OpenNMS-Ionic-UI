import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { ModalController, NavParams } from 'ionic-angular';

import { RequisitionInterfacePage } from '../requisition-interface/requisition-interface';
import { RequisitionAssetPage } from '../requisition-asset/requisition-asset';
import { RequisitionCategoryPage } from '../requisition-category/requisition-category';
import { OnmsRequisitionNode } from '../../models/onms-requisition-node';
import { OnmsRequisitionInterface } from '../../models/onms-requisition-interface';
import { OnmsRequisitionAsset } from '../../models/onms-requisition-asset';
import { OnmsRequisitionCategory } from '../../models/onms-requisition-category';

@Component({
  selector: 'page-requisition-node',
  templateUrl: 'requisition-node.html'
})
export class RequisitionNodePage implements OnInit {

  mode: string = 'basic';
  node: OnmsRequisitionNode;
  form: FormGroup;

  constructor(
    private modalCtrl: ModalController,
    private navParams: NavParams
  ) {}

  ngOnInit() {
    this.node = this.navParams.get('node');
    this.initForm();
  }

  onAddInterface(intf: OnmsRequisitionInterface) {
    this.updateInterface(null, (newIntf) => {
      console.log('interface added');
    });    
  }

  onAddAsset(asset: OnmsRequisitionAsset) {
    this.updateAsset(null, (newAsset) => {
      console.log('asset added');
    });
  }

  onAddCategory(category: OnmsRequisitionCategory) {
    this.updateCategory(null, (newCategory) => {
      console.log('category added');
    });
  }

  onEditInterface(intf: OnmsRequisitionInterface) {
    this.updateInterface(intf, (intfUpdated) => {
      console.log('interface updated');
    });    
  }

  onEditAsset(asset: OnmsRequisitionAsset) {
    this.updateAsset(asset, (updatedAsset) => {
      console.log('asset updated');
    });
  }

  onEditCategory(category: OnmsRequisitionCategory) {
    this.updateCategory(category, (updatedCategory) => {
      console.log('category  updated');
    });
  }

  private updateInterface(intf: OnmsRequisitionInterface, handler: (updated: OnmsRequisitionInterface) => void) {
    const modal = this.modalCtrl.create(RequisitionInterfacePage, { intf: intf });
    modal.onDidDismiss((updatedIntf:OnmsRequisitionInterface) => {
      if (updatedIntf) handler(updatedIntf);
    });
    modal.present();
  }

  private updateAsset(asset: OnmsRequisitionAsset, handler: (updated: OnmsRequisitionAsset) => void) {
    const modal = this.modalCtrl.create(RequisitionAssetPage, { asset: asset });
    modal.onDidDismiss((updatedAsset: OnmsRequisitionAsset) => {
      if (updatedAsset) handler(updatedAsset);
    });
    modal.present();
  }

  private updateCategory(category: OnmsRequisitionCategory, handler: (updated: OnmsRequisitionCategory) => void) {
    const modal = this.modalCtrl.create(RequisitionCategoryPage, { category: category });
    modal.onDidDismiss((updatedCategory: OnmsRequisitionCategory) => {
      if (updatedCategory) handler(updatedCategory);
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

}
