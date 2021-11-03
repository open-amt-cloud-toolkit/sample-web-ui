/*********************************************************************
* Copyright (c) Intel Corporation 2021
* SPDX-License-Identifier: Apache-2.0
**********************************************************************/
import { TestBed } from '@angular/core/testing'
import { Router } from '@angular/router'
import { AuthService } from './auth.service'
import { RouterTestingModule } from '@angular/router/testing'
import { BrowserAnimationsModule } from '@angular/platform-browser/animations'
import { SharedModule } from './shared/shared.module'
// import { of } from 'rxjs'

describe('AuthService', () => {
  let service: AuthService
  let httpClientSpy: { get: jasmine.Spy }
  let routerSpy
  beforeEach(() => {
    httpClientSpy = jasmine.createSpyObj('HttpClient', ['get'])
    routerSpy = jasmine.createSpyObj('Router', ['navigate'])
    TestBed.configureTestingModule({
      imports: [BrowserAnimationsModule, SharedModule, RouterTestingModule.withRoutes([])]
    })
    service = new AuthService(httpClientSpy as any, routerSpy as Router)
  })

  it('should be created', () => {
    expect(service).toBeTruthy()
  })

  it('should return error on delete', () => {
    expect(service.onDeleteError({ error: ['test'] })).toEqual(['test'])
  })

  it('should return token from localstorage', () => {
    localStorage.setItem('loggedInUser', JSON.stringify({ token: '1234567qwertsdfg' }))
    const getToken: any = localStorage.getItem('loggedInUser')
    const token: string = JSON.parse(getToken).token
    expect(service.getLoggedUserToken()).toBe(token)
  })

  it('should redirect to logic', async () => {
    await service.logout()
    expect(service.router.navigate).toHaveBeenCalledWith(['/login'])
  })

  it('should call login api', () => {
    // expect(loginSpy.calls.any()).toBe(true, 'login called ')
  })

  it('should return error messages', () => {
    expect(service.onError('test')).toEqual(['test'])
  })

  it('should user errors return error messages', () => {
    const errors = { error: { errors: [{ msg: 'test', param: '1234', location: 'string', value: 'string' }] } }
    expect(service.onError(errors)).toEqual(['test: 1234'])
  })

  it('should user error object return error messages', () => {
    const errors = { error: { message: 'test' } }
    expect(service.onError(errors)).toEqual(['test'])
  })
})
