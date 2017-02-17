import { Component } from '@angular/core';
import { NavController, NavParams, LoadingController, AlertController, ToastController, ActionSheetController } from 'ionic-angular';

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

  }

  onSearch() {

  }

  onCancelSearch() {

  }

  onAddNode() {

  }

  onEditNode(node: OnmsRequisitionNode) {
    this.navCtrl.push(RequisitionNodePage, { node: node })
  }

  onRemoveNode() {

  }

}
