import { Injectable } from '@angular/core';
import { Http, Headers, RequestOptions, Response } from '@angular/http';
import { Observable } from 'rxjs/Observable';

import { OnmsServersService } from '../services/onms-servers';
import { OnmsServer } from '../models/onms-server';

import 'rxjs/Rx';

@Injectable()
export class HttpService {

  defaultServer: OnmsServer;

  constructor(private http: Http, private serversService: OnmsServersService) {
    serversService.defaultUpdated.subscribe((defaultServer:OnmsServer) => this.defaultServer = defaultServer);
  }

  private getOptions() : RequestOptions {
    let headers = new Headers();
    headers.append('Authorization', 'Basic ' + btoa(this.defaultServer.username + ':' + this.defaultServer.password));
    headers.append('Accept', 'application/json');
    return new RequestOptions({ headers: headers });
  }

  private getBaseUrl() : string {
    return this.defaultServer.url;
  }

  private handleError(error: Response | any) {
    let errMsg: string;
    if (error instanceof Response) {
      const body = error.json() || '';
      const err = body.error || JSON.stringify(body);
      errMsg = `${error.status} - ${error.statusText || ''} ${err}`;
    } else {
      errMsg = error.message ? error.message : error.toString();
    }
    console.error(errMsg);
    return Observable.throw(errMsg);
  }

  register() {
    this.serversService.defaultUpdated.subscribe((defaultServer:OnmsServer) => this.defaultServer = defaultServer);
  }

  get(url: string) : Observable<Response> {
    return this.http.get(this.getBaseUrl() + url, this.getOptions())
      .catch(this.handleError);
  }

  put(url: string, contentType: string, data: any) : Observable<Response> {
    let options: RequestOptions = this.getOptions();
    if (contentType) {
      options.headers.append('Content-Type', contentType);
    }
    let body: any;
    if (data) {
      body = typeof data === "string" ? data : JSON.stringify(data);
    }
    return this.http.put(this.getBaseUrl() + url, body, options)
      .catch(this.handleError);
  }

  post(url: string, contentType: string, data: any) : Observable<Response> {
    let options: RequestOptions = this.getOptions();
    options.headers.append('Content-Type', contentType);
    let body = typeof data === "string" ? data : JSON.stringify(data);
    return this.http.post(this.getBaseUrl() + url, body, options)
      .catch(this.handleError);
  }

}