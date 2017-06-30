import { Badge } from '@ionic-native/badge';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';
import { Storage } from '@ionic/storage';

export class PlatformMock {
  public ready(): Promise<{String}> {
    return new Promise((resolve) => {
      resolve('READY');
    });
  }

  public getQueryParam() {
    return true;
  }

  public registerBackButtonAction(fn: Function, priority?: number): Function {
    return (() => true);
  }

  public hasFocus(ele: HTMLElement): boolean {
    return true;
  }

  public doc(): HTMLDocument {
    return document;
  }

  public is(): boolean {
    return true;
  }

  public getElementComputedStyle(container: any): any {
    return {
      paddingLeft: '10',
      paddingTop: '10',
      paddingRight: '10',
      paddingBottom: '10',
    };
  }

  public onResize(callback: any) {
    return callback;
  }

  public registerListener(ele: any, eventName: string, callback: any): Function {
    return (() => true);
  }

  public win(): Window {
    return window;
  }

  public raf(callback: any): number {
    return 1;
  }

  public timeout(callback: any, timer: number): any {
    return setTimeout(callback, timer);
  }

  public cancelTimeout(id: any) {
    // do nothing
  }

  public getActiveElement(): any {
    return document['activeElement'];
  }
}

export class StatusBarMock extends StatusBar {
  styleDefault() {
    return;
  }
}

export class SplashScreenMock extends SplashScreen {
  hide() {
    return;
  }
}

export class BadgeMock extends Badge {
  registerPermission() {
    return new Promise<boolean>(resolve => resolve(true));
  }
  clear() {
    return new Promise<boolean>(resolve => resolve(true));
  }
}

export class StorageMock extends Storage {
  data: { [key: string]: any } = {};

  constructor() {
    super(null);
  }

  get(key: string): Promise<any> {
    return new Promise<any>((resolve) => {
      resolve(this.data[key]);
    });
  }

  set(key: string, value: any): Promise<any> {
    this.data[key] = value;
    return this.get(key);
  }
}

export class ViewControllerMock {
  opts: any;

  create(opts?: any) {
    this.opts = opts;
    return this;
  }

  present() {
    console.log('present view-controller');
    console.log(this.opts);
  }

  dismiss() {
    console.log('dismiss view-controller');
  }

}