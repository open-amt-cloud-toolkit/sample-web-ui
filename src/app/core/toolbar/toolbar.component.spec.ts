/*********************************************************************
* Copyright (c) Intel Corporation 2021
* SPDX-License-Identifier: Apache-2.0
**********************************************************************/
import { EventEmitter } from '@angular/core'
import { ComponentFixture, TestBed } from '@angular/core/testing'
import { BrowserAnimationsModule } from '@angular/platform-browser/animations'
import { Router } from '@angular/router'
import { of } from 'rxjs'
import { AuthService } from 'src/app/auth.service'
import { SharedModule } from 'src/app/shared/shared.module'
import { ToolbarComponent } from './toolbar.component'

describe('ToolbarComponent', () => {
  let component: ToolbarComponent
  let fixture: ComponentFixture<ToolbarComponent>
  let logoutSpy: jasmine.Spy
  beforeEach(async () => {
    const authService = jasmine.createSpyObj('AuthService', ['logout'])
    const routerSpy = jasmine.createSpyObj('Router', ['navigate'])
    const authServiceStub = {
      loggedInSubject: new EventEmitter<boolean>(false)
    }
    logoutSpy = authService.logout.and.returnValue(of({}))
    await TestBed.configureTestingModule({
      imports: [SharedModule, BrowserAnimationsModule],
      declarations: [ToolbarComponent],
      providers: [
        { provide: Router, useValue: routerSpy },
        { provide: AuthService, useValue: { ...authServiceStub, ...authService } }
      ]
    })
      .compileComponents()
    // authServiceSpy = new AuthService(httpClientSpy as any, routerSpy as Router)
  })

  beforeEach(() => {
    fixture = TestBed.createComponent(ToolbarComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })

  it('should fire display about dialog', () => {
    const disaboutSpy = spyOn(component.dialog, 'open')
    component.displayAbout()
    expect(disaboutSpy).toHaveBeenCalled()
  })

  it('should redirect to logic', async () => {
    await component.logout()
    expect(logoutSpy).toHaveBeenCalled()
  })
})
