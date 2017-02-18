import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { NavParams, ViewController, AlertController } from 'ionic-angular';

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
    private navParams: NavParams,
    private viewCtrl: ViewController,
    private alertCtrl: AlertController,
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

  onShowCategories() {
    const options = this.alertCtrl.create({
      title: 'Choose Category',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel'
        },
        {
          text: 'Ok',
          handler: data => this.form.get('name').setValue(data)
        }
      ]
    });
    this.availableCategories.forEach(category => {
      options.addInput({
        name: 'options',
        value: category,
        label: category,
        type: 'radio'
      })
    })
    options.present();
  }

  onSave() {
    Object.assign(this.category, this.form.value);
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
