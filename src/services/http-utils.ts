import { Injectable } from '@angular/core';
import { Http, Headers, RequestOptions, Response } from '@angular/http';
import { Observable } from 'rxjs/Observable';

import { OnmsServer } from '../models/onms-server';

import 'rxjs/Rx';

@Injectable()
export class HttpUtilsService {

  constructor(private http: Http) {}

  getOptions(server: OnmsServer) : RequestOptions {
    let headers = new Headers();
    headers.append('Authorization', 'Basic ' + btoa(server.username + ':' + server.password));
    headers.append('Accept', "application/json");
    return new RequestOptions({ headers: headers });
  }

  get(server: OnmsServer, url: string) : Observable<Response> {
    return this.http.get(server.url + url, this.getOptions(server));
  }
}