import { Injectable, OnDestroy } from '@angular/core';
import { Http, Headers, RequestOptions, Response } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import { Subscription } from 'rxjs/Rx';
import 'rxjs/Rx';

import { OnmsServersService } from '../services/onms-servers';
import { OnmsServer } from '../models/onms-server';

export function handleError(error: Response | any) {
  let errMsg = '';
  if (error instanceof Response) {
    if (error.status == 0) {
      errMsg = 'Remote Server Unreachable.';
    } else {
      errMsg = `${error.status} - ${error.statusText}`;
    }
  } else {
    errMsg = error.message ? error.message : error.toString();
  }
  console.error(errMsg);
  return Observable.throw(errMsg);
}

@Injectable()
export class HttpService implements OnDestroy {

  defaultServer: OnmsServer;

  private subscription: Subscription;

  constructor(private http: Http, private serversService: OnmsServersService) {
    serversService.defaultUpdated.subscribe((defaultServer:OnmsServer) => this.defaultServer = defaultServer);
  }

  private getOptions(accept: string = 'application/json') : RequestOptions {
    let headers = new Headers();
    headers.append('Authorization', 'Basic ' + btoa(this.defaultServer.username + ':' + this.defaultServer.password));
    headers.append('Accept', accept);
    return new RequestOptions({ headers: headers });
  }

  private getBaseUrl() : string {
    return this.defaultServer.url;
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  register() {
    this.subscription = this.serversService.defaultUpdated
      .subscribe((defaultServer:OnmsServer) => this.defaultServer = defaultServer);
  }

  get(url: string, accept?: string) : Observable<Response> {
    return this.http.get(this.getBaseUrl() + url, this.getOptions(accept))
      .catch(handleError);
  }

  put(url: string, contentType?: string, data?: any) : Observable<Response> {
    let options: RequestOptions = this.getOptions();
    if (contentType) {
      options.headers.append('Content-Type', contentType);
    }
    let body: any;
    if (data) {
      body = typeof data === 'string' ? data : JSON.stringify(data);
    }
    return this.http.put(this.getBaseUrl() + url, body, options)
      .catch(handleError);
  }

  post(url: string, contentType: string, data: any) : Observable<Response> {
    let options: RequestOptions = this.getOptions();
    options.headers.append('Content-Type', contentType);
    let body = typeof data === "string" ? data : JSON.stringify(data);
    return this.http.post(this.getBaseUrl() + url, body, options)
      .catch(handleError);
  }

  delete(url: string) : Observable<Response> {
    let options: RequestOptions = this.getOptions();
    return this.http.delete(this.getBaseUrl() + url, options)
      .catch(handleError);
  }

  encodeParams(data: Object) : string {
    let params: string[] = [];
    Object.keys(data).forEach(k => {
      if (data[k]) params.push(`${k}=${data[k]}`)
    });
    return params.join('&');
  }

}