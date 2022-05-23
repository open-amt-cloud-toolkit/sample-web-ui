/*********************************************************************
* Copyright (c) Intel Corporation 2021
* SPDX-License-Identifier: Apache-2.0
**********************************************************************/
import { ComponentFixture, TestBed } from '@angular/core/testing'
import { ReactiveFormsModule } from '@angular/forms'
import { BrowserAnimationsModule } from '@angular/platform-browser/animations'
import { Router } from '@angular/router'
import { of, throwError } from 'rxjs'
import { AuthService } from '../auth.service'
import { SharedModule } from '../shared/shared.module'

import { LoginComponent } from './login.component'

describe('LoginComponent', () => {
  let component: LoginComponent
  let fixture: ComponentFixture<LoginComponent>
  let routerSpy
  let authService: any
  let loginSpy: jasmine.Spy
  let loginErrorSpy: jasmine.Spy
  beforeEach(async () => {
    routerSpy = jasmine.createSpyObj('Router', ['navigate'])
    authService = jasmine.createSpyObj('AuthService', ['login'])
    await TestBed.configureTestingModule({
      imports: [BrowserAnimationsModule, SharedModule, ReactiveFormsModule],
      declarations: [LoginComponent],
      providers: [{ provide: Router, useValue: routerSpy }, { provide: AuthService, useValue: authService }]
    }).compileComponents()
  })

  beforeEach(() => {
    fixture = TestBed.createComponent(LoginComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
  it('Should call login service when onSubmit()', async () => {
    loginSpy = authService.login.and.returnValue(of({ token: 'abc' }))
    Object.defineProperty(component.loginForm, 'valid', {
      get: () => true
    })
    await component.onSubmit()
    expect(loginSpy).toHaveBeenCalled()
  })
  it('Should fail when login service throws 405 status', async () => {
    loginErrorSpy = authService.login.and.returnValue(throwError({ status: 405, error: { message: 'failed' } }))
    Object.defineProperty(component.loginForm, 'valid', {
      get: () => true
    })
    await component.onSubmit()
    expect(loginErrorSpy).toHaveBeenCalled()
  })
  it('Should fail when login service throws an error', async () => {
    loginErrorSpy = authService.login.and.returnValue(throwError({ status: 401, error: { message: 'failed' } }))
    Object.defineProperty(component.loginForm, 'valid', {
      get: () => true
    })
    await component.onSubmit()
    expect(loginErrorSpy).toHaveBeenCalled()
  })
})
