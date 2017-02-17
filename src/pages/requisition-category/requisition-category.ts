import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { ViewController, NavParams } from 'ionic-angular';

import { OnmsRequisitionCategory } from '../../models/onms-requisition-category';
import { OnmsRequisitionsService } from '../../services/onms-requisitions';

@Component({
  selector: 'page-requisition-category',
  templateUrl: 'requisition-category.html'
})
export class RequisitionCategoryPage implements OnInit {

  mode: string;
    form: FormGroup;

  category: OnmsRequisitionCategory;
  availableCategories: string[] = [];

  constructor(
    private viewCtrl: ViewController,
    private navParams: NavParams,
    private requisitionsService: OnmsRequisitionsService
  ) {}

  ngOnInit() {
    this.category  = this.navParams.get('category');
    this.mode = this.category ? 'Edit' : 'Add';

    if (this.mode == 'Add') {
      this.category = new OnmsRequisitionCategory();
    }
    
    this.requisitionsService.getAvailableCategories()
      .then(categories => this.availableCategories = categories)
      .catch(error => console.error(error));
    this.initForm();    
  }

  onChooseExisting(name: string) {
    this.category.name = name;
  }

  onSave() {
    this.viewCtrl.dismiss(this.category);
  }

  onCancel() {
    this.viewCtrl.dismiss();
  }

  private initForm() {
    this.form = new FormGroup({
      'name' : new FormControl(this.category.name, Validators.required)
    });
  }

}
