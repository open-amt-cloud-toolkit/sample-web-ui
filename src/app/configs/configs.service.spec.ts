/*********************************************************************
* Copyright (c) Intel Corporation 2021
* SPDX-License-Identifier: Apache-2.0
**********************************************************************/
import { TestBed } from '@angular/core/testing'
import { Router } from '@angular/router'
import { of, throwError } from 'rxjs'
import { AuthService } from '../auth.service'

import { ConfigsService } from './configs.service'

describe('ConfigsService', () => {
  let service: ConfigsService
  let httpClientSpy: { get: jasmine.Spy, post: jasmine.Spy, patch: jasmine.Spy, delete: jasmine.Spy }
  let routerSpy
  beforeEach(() => {
    httpClientSpy = jasmine.createSpyObj('HttpClient', ['get', 'post', 'delete', 'patch'])
    routerSpy = jasmine.createSpyObj('Router', ['navigate'])
    TestBed.configureTestingModule({})

    service = new ConfigsService(new AuthService(httpClientSpy as any, routerSpy as Router), httpClientSpy as any)
  })

  it('should be created', () => {
    expect(service).toBeTruthy()
  })

  it('should return all the configs when requested for all configs', (done: DoneFn) => {
    const configResponse = {
      data: [{
        configName: 'config1',
        mpsServerAddress: '255.255.255.1',
        mpsPort: 4433,
        username: 'admin',
        password: 'password',
        commonName: '255.255.255.1',
        serverAddressFormat: 3,
        authMethod: 2,
        mpsRootCertificate: 'mpsrootcertificate',
        proxyDetails: ''
      }],
      totalCount: 1
    }

    httpClientSpy.get.and.returnValue(of(configResponse))

    service.getData().subscribe(response => {
      expect(response).toEqual(configResponse)
      done()
    })
  })

  it('should return errors on request all configs', (done: DoneFn) => {
    const errors = {
      error: 'test 404 error',
      status: 404,
      statusText: 'Not Found'
    }
    httpClientSpy.get.and.returnValue(throwError(errors))
    service.getData().subscribe(null, (err) => {
      expect(err[0].status).toBe(404)
      done()
    })
  })

  it('should load first 25 profiles when get all profile request fired', (done: DoneFn) => {
    const configResponse = {
      data: [{
        configName: 'config1',
        mpsServerAddress: '255.255.255.1',
        mpsPort: 4433,
        username: 'admin',
        password: 'password',
        commonName: '255.255.255.1',
        serverAddressFormat: 3,
        authMethod: 2,
        mpsRootCertificate: 'mpsrootcertificate',
        proxyDetails: ''
      }],
      totalCount: 1
    }

    httpClientSpy.get.and.returnValue(of(configResponse))

    service.getData({ pageSize: 25, count: 'true', startsFrom: 0 }).subscribe(response => {
      expect(response).toEqual(configResponse)
      done()
    })
  })

  it('should return the specific config detail when requested with name', (done: DoneFn) => {
    const configResponse = {
      configName: 'config1',
      mpsServerAddress: '255.255.255.1',
      mpsPort: 4433,
      username: 'admin',
      password: 'password',
      commonName: '255.255.255.1',
      serverAddressFormat: 3,
      authMethod: 2,
      mpsRootCertificate: 'mpsrootcertificate',
      proxyDetails: ''
    }

    httpClientSpy.get.and.returnValue(of(configResponse))

    service.getRecord('config1').subscribe(response => {
      expect(response).toEqual(configResponse)
      done()
    })
  })

  it('should throw the error when requested with name', (done: DoneFn) => {
    const errors = {
      status: 404,
      message: 'Not Found'
    }
    httpClientSpy.get.and.returnValue(throwError(errors))
    service.getRecord('config1').subscribe(null, err => {
      expect(errors.status).toBe(err[0].status)
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

  it('should throw the error when a delete request fired', (done: DoneFn) => {
    const errors = {
      status: 404,
      message: 'Not Found',
      error: 'Not Found'
    }
    httpClientSpy.delete.and.returnValue(throwError(errors))

    service.delete('config1').subscribe(null, (err) => {
      expect(errors.error).toContain(err)
      done()
    })

    expect(httpClientSpy.delete.calls.count()).toEqual(1)
  })

  it('should create the config when a post request is fired', (done: DoneFn) => {
    const configReq = {
      configName: 'config1',
      mpsServerAddress: '255.255.255.1',
      mpsPort: 4433,
      username: 'admin',
      password: 'password',
      commonName: '255.255.255.1',
      serverAddressFormat: 3,
      authMethod: 2,
      mpsRootCertificate: 'mpsrootcertificate',
      proxyDetails: ''
    }

    httpClientSpy.post.and.returnValue(of(configReq))

    service.create(configReq).subscribe(response => {
      expect(response).toEqual(configReq)
      done()
    })

    expect(httpClientSpy.post.calls.count()).toEqual(1)
  })

  it('should throw error when a post request is fired', (done: DoneFn) => {
    const configReq = {
      configName: 'config1',
      mpsServerAddress: '255.255.255.1',
      mpsPort: 4433,
      username: 'admin',
      password: 'password',
      commonName: '255.255.255.1',
      serverAddressFormat: 3,
      authMethod: 2,
      mpsRootCertificate: 'mpsrootcertificate',
      proxyDetails: ''
    }

    const error = {
      status: 404,
      message: 'Not Found'
    }

    httpClientSpy.post.and.returnValue(throwError(error))

    service.create(configReq).subscribe(null, err => {
      expect(error.status).toBe(err[0].status)
      done()
    })

    expect(httpClientSpy.post.calls.count()).toEqual(1)
  })

  it('should update the config when a update request is fired', (done: DoneFn) => {
    const configReq = {
      configName: 'config1',
      mpsServerAddress: '255.255.255.1',
      mpsPort: 4433,
      username: 'admin',
      password: 'password',
      commonName: '255.255.255.1',
      serverAddressFormat: 3,
      authMethod: 2,
      mpsRootCertificate: 'mpsrootcertificate',
      proxyDetails: ''
    }

    httpClientSpy.patch.and.returnValue(of(configReq))

    service.update(configReq).subscribe(response => {
      expect(response).toEqual(configReq)
      done()
    })

    expect(httpClientSpy.patch.calls.count()).toEqual(1)
  })

  it('should throw errors when a update request is fired', (done: DoneFn) => {
    const configReq = {
      configName: 'config1',
      mpsServerAddress: '255.255.255.1',
      mpsPort: 4433,
      username: 'admin',
      password: 'password',
      commonName: '255.255.255.1',
      serverAddressFormat: 3,
      authMethod: 2,
      mpsRootCertificate: 'mpsrootcertificate',
      proxyDetails: ''
    }

    const errors = {
      status: 404,
      message: 'Not Found'
    }
    httpClientSpy.patch.and.returnValue(throwError(errors))

    service.update(configReq).subscribe(null, err => {
      expect(errors.status).toBe(err[0].status)
      done()
    })

    expect(httpClientSpy.patch.calls.count()).toEqual(1)
  })

  it('should get mps root certificate', (done: DoneFn) => {
    httpClientSpy.get.and.returnValue(of('123456ertyxcfgvgrdx'))
    service.loadMPSRootCert().subscribe(response => {
      expect(response).toEqual('123456ertyxcfgvgrdx')
      done()
    })
  })

  it('should throw error on request mps root certificated', (done: DoneFn) => {
    const error = 'Error loading CIRA config'
    httpClientSpy.get.and.returnValue(throwError(error))
    service.loadMPSRootCert().subscribe(null, err => {
      expect(error).toContain(err)
      done()
    })
  })
})
