/*********************************************************************
* Copyright (c) Intel Corporation 2021
* SPDX-License-Identifier: Apache-2.0
**********************************************************************/
import { ComponentFixture, TestBed } from '@angular/core/testing'
import { ReactiveFormsModule } from '@angular/forms'
import { BrowserAnimationsModule } from '@angular/platform-browser/animations'
import { Router } from '@angular/router'
import { AuthService } from '../auth.service'
import { SharedModule } from '../shared/shared.module'

import { LoginComponent } from './login.component'

describe('LoginComponent', () => {
  let component: LoginComponent
  let fixture: ComponentFixture<LoginComponent>
  let routerSpy
  let authService
  beforeEach(async () => {
    routerSpy = jasmine.createSpyObj('Router', ['navigate'])
    authService = jasmine.createSpyObj('AuthService', ['isLoggedIn'])

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

  it('should turn login pass visibility on when it is off', () => {
    component.loginPassInputType = 'password'
    component.toggleLoginPassVisibility()

    expect(component.loginPassInputType).toEqual('text')
  })

  it('should turn login pass visibility off when it is on', () => {
    component.loginPassInputType = 'text'
    component.toggleLoginPassVisibility()

    expect(component.loginPassInputType).toEqual('password')
  })
})
