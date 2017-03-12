import { Component, Input, OnInit } from '@angular/core';

import { OnmsServer } from '../models/onms-server';
import { OnmsServersService } from '../services/onms-servers';

@Component({
  selector: 'onms-title',
  template: `
    <ion-title>{{ title }}<p class="subtitle">{{ server?.type }} {{ server?.version }} {{ server?.name }}</p></ion-title>
  `
})
export class OnmsTitleComponent implements OnInit {

  @Input('title') title: string;
  server: OnmsServer;

  constructor(private service: OnmsServersService) {}

  ngOnInit() {
    this.service.getDefaultServer()
      .then(server => this.server = server)
      .catch(error => console.error(error));
  }

}
