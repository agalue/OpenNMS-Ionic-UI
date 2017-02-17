import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { NavController, NavParams } from 'ionic-angular';

import { OnmsRequisitionNode } from '../../models/onms-requisition-node';

@Component({
  selector: 'page-requisition-node',
  templateUrl: 'requisition-node.html'
})
export class RequisitionNodePage implements OnInit {

  mode: string = 'basic';
  node: OnmsRequisitionNode;
  form: FormGroup;

  constructor(
    private navCtrl: NavController,
    private navParams: NavParams
  ) {}

  ngOnInit() {
    this.node = this.navParams.get('node');
    this.initForm();
  }

  private initForm() {
    console.log('initialize form');
    this.form = new FormGroup({
      'foreignId' : new FormControl(this.node.foreignId, Validators.required),
      'nodeLabel' : new FormControl(this.node.nodeLabel, Validators.required)
    });
  }

}
