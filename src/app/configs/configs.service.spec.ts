/*********************************************************************
* Copyright (c) Intel Corporation 2022
* SPDX-License-Identifier: Apache-2.0
**********************************************************************/

import { TestBed } from '@angular/core/testing'
import { Router } from '@angular/router'
import { of } from 'rxjs'
import { AuthService } from '../auth.service'

import { ConfigsService } from './configs.service'
import { AuthMethods, ServerAddressFormats, Config, ConfigsResponse } from './configs.constants'

describe('ConfigsService', () => {
  let service: ConfigsService
  let httpClientSpy: { get: jasmine.Spy, post: jasmine.Spy, patch: jasmine.Spy, delete: jasmine.Spy }
  let routerSpy
  let config: Config
  beforeEach(() => {
    httpClientSpy = jasmine.createSpyObj('HttpClient', ['get', 'post', 'delete', 'patch'])
    routerSpy = jasmine.createSpyObj('Router', ['navigate'])
    TestBed.configureTestingModule({})
    config = {
        configName: 'config1',
        mpsServerAddress: '255.255.255.1',
        mpsPort: 4433,
        username: 'admin',
        password: 'password',
        commonName: '255.255.255.1',
        serverAddressFormat: ServerAddressFormats.IPv4.value,
        authMethod: AuthMethods.USERNAME_PASSWORD.value,
        mpsRootCertificate: 'mpsrootcertificate'
    }
    service = new ConfigsService(new AuthService(httpClientSpy as any, routerSpy as Router), httpClientSpy as any)
  })

  afterEach(() => {
    TestBed.resetTestingModule()
  })

  it('should be created', () => {
    expect(service).toBeTruthy()
  })

  it('should return all the configs when requested for all configs', (done: DoneFn) => {
    const configsResponse: ConfigsResponse = {
      data: [config],
      totalCount: 1
    }
    httpClientSpy.get.and.returnValue(of(configsResponse))
    service.getData().subscribe(response => {
      expect(response).toEqual(configsResponse)
      done()
    })
  })

  it('should return the specific config detail when requested with name', (done: DoneFn) => {
    httpClientSpy.get.and.returnValue(of(config))
    service.getRecord('config1').subscribe(response => {
      expect(response).toEqual(config)
      done()
    })
  })

  it('should delete the specified config when a delete request fired', (done: DoneFn) => {
    httpClientSpy.delete.and.returnValue(of({}))
    service.delete('config1').subscribe(() => {
      done()
    })
    expect(httpClientSpy.delete.calls.count()).toEqual(1)
  })

  it('should create the config when a post request is fired', (done: DoneFn) => {
    httpClientSpy.post.and.returnValue(of(config))
    service.create(config).subscribe(response => {
      expect(response).toEqual(config)
      done()
    })
    expect(httpClientSpy.post.calls.count()).toEqual(1)
  })

  it('should update the config when a update request is fired', (done: DoneFn) => {
    httpClientSpy.patch.and.returnValue(of(config))
    service.update(config).subscribe(response => {
      expect(response).toEqual(config)
      done()
    })
    expect(httpClientSpy.patch.calls.count()).toEqual(1)
  })
})
