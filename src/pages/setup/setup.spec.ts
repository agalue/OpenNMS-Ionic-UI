import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';
import { IonicModule, Platform, NavController } from 'ionic-angular/index';

import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';
import { Badge } from '@ionic-native/badge';

import { PlatformMock, StatusBarMock, SplashScreenMock, BadgeMock } from '../../../test-config/mocks-ionic';

import { SetupPage } from './setup';

describe('SetupPage', () => {
  let de: DebugElement;
  let comp: SetupPage;
  let fixture: ComponentFixture<SetupPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [SetupPage],
      imports: [
        IonicModule.forRoot(SetupPage)
      ],
      providers: [
        NavController,
        { provide: Platform, useClass: PlatformMock},
        { provide: StatusBar, useClass: StatusBarMock },
        { provide: SplashScreen, useClass: SplashScreenMock },
        { provide: Badge, useClass: BadgeMock }
      ]
    });
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SetupPage);
    comp = fixture.componentInstance;
    de = fixture.debugElement.query(By.css('h1'));
  });

  it('should create component', () => expect(comp).toBeDefined());

  it('should have expected text', () => {
    fixture.detectChanges();
    const h1 = de.nativeElement;
    expect(h1.innerText).toMatch('Welcome to the OpenNMS UI');
  });
});
