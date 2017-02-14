import { Injectable } from '@angular/core';
import { Http, Headers, RequestOptions, Response } from '@angular/http';
import { Observable } from 'rxjs/Observable';

import { OnmsServer } from '../models/onms-server';

import 'rxjs/Rx';

@Injectable()
export class HttpUtilsService {

  constructor(private http: Http) {}

  private appendAuth(server: OnmsServer, headers: Headers) {
    headers.append('Authorization', 'Basic ' + btoa(server.username + ':' + server.password));
  }

  get(server: OnmsServer, url: string) : Observable<Response> {
    let headers = new Headers();
    this.appendAuth(server, headers);
    headers.append('Accept', 'application/json');
    let options: RequestOptions = new RequestOptions({ headers: headers });
    return this.http.get(server.url + url, options);
  }

  put(server: OnmsServer, url: string, contentType: string, data: any) : Observable<Response> {
    let headers = new Headers();
    this.appendAuth(server, headers);
    headers.append('Accept', 'application/json');
    headers.append('Content-Type', contentType);
    let options: RequestOptions = new RequestOptions({ headers: headers });
    let body = typeof data === "string" ? data : JSON.stringify(data);
    return this.http.put(server.url + url, body, options);
  }

  post(server: OnmsServer, url: string, contentType: string, data: any) : Observable<Response> {
    let headers = new Headers();
    this.appendAuth(server, headers);
    headers.append('Accept', 'application/json');
    headers.append('Content-Type', contentType);
    let options: RequestOptions = new RequestOptions({ headers: headers });
    let body = typeof data === "string" ? data : JSON.stringify(data);
    return this.http.post(server.url + url, body, options);
  }

}