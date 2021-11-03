/*********************************************************************
* Copyright (c) Intel Corporation 2021
* SPDX-License-Identifier: Apache-2.0
**********************************************************************/
import { TestBed } from '@angular/core/testing'
import { Router } from '@angular/router'
import { of, throwError } from 'rxjs'
import { AuthService } from '../auth.service'

import { DomainsService } from './domains.service'

describe('DomainsService', () => {
  let service: DomainsService
  let httpClientSpy: { get: jasmine.Spy, patch: jasmine.Spy, post: jasmine.Spy, delete: jasmine.Spy }
  let routerSpy
  beforeEach(() => {
    httpClientSpy = jasmine.createSpyObj('HttpClient', ['get', 'patch', 'post', 'delete'])
    routerSpy = jasmine.createSpyObj('Router', ['navigate'])
    TestBed.configureTestingModule({})
    service = new DomainsService(new AuthService(httpClientSpy as any, routerSpy as Router), httpClientSpy as any)
  })

  it('should be created', () => {
    expect(service).toBeTruthy()
  })

  it('should return array of 25 domains when get all domains called ', (done: DoneFn) => {
    const domainResponse = {
      data: [{
        profileName: 'testDomain',
        domainSuffix: 'testDomain.com',
        provisioningCert: 'domainCertLongText',
        provisioningCertPassword: 'password',
        provisioningCertStorageFormat: 'string'
      }],
      totalCount: 1
    }

    httpClientSpy.get.and.returnValue(of(domainResponse))

    service.getData({ pageSize: 25, startsFrom: 0, count: 'true' }).pipe().subscribe(response => {
      expect(response).toEqual(domainResponse)
      done()
    })
    expect(httpClientSpy.get.calls.count()).toEqual(1, 'one call')
  })

  it('should return array of domains when get all domains called ', (done: DoneFn) => {
    const domainResponse = {
      data: [{
        profileName: 'testDomain',
        domainSuffix: 'testDomain.com',
        provisioningCert: 'domainCertLongText',
        provisioningCertPassword: 'password',
        provisioningCertStorageFormat: 'string'
      }],
      totalCount: 1
    }

    httpClientSpy.get.and.returnValue(of(domainResponse))

    service.getData().pipe().subscribe(response => {
      expect(response).toEqual(domainResponse)
      done()
    })
    expect(httpClientSpy.get.calls.count()).toEqual(1, 'one call')
  })
  it('should throw errors when get all domains called ', (done: DoneFn) => {
    const error = {
      status: 404,
      message: 'Not Found'
    }
    httpClientSpy.get.and.returnValue(throwError(error))

    service.getData().pipe().subscribe(null, err => {
      expect(error.status).toBe(err[0].status)
      done()
    })
    expect(httpClientSpy.get.calls.count()).toEqual(1, 'one call')
  })

  it('should return a single domain object detail when a single record is requested', (done: DoneFn) => {
    const domainResponse = {
      profileName: 'testDomain',
      domainSuffix: 'testDomain.com',
      provisioningCert: 'domainCertLongText',
      provisioningCertPassword: 'password',
      provisioningCertStorageFormat: 'string'
    }

    httpClientSpy.get.and.returnValue(of(domainResponse))

    service.getRecord('testDomain').subscribe(response => {
      expect(response).toEqual(domainResponse)
      done()
    })
  })

  it('should return errors on a single domain object detail when a single record is requested', (done: DoneFn) => {
    const error = {
      status: 404,
      message: 'Not Found'
    }

    httpClientSpy.get.and.returnValue(throwError(error))

    service.getRecord('testDomain').subscribe(null, err => {
      expect(error.status).toBe(err[0].status)
      done()
    })
  })

  it('should return the updated domain details when a domain is updated', (done: DoneFn) => {
    const domainReq = {
      profileName: 'testDomain',
      domainSuffix: 'testDomain.com',
      provisioningCert: 'domainCertLongText',
      provisioningCertPassword: 'password',
      provisioningCertStorageFormat: 'string'
    }

    httpClientSpy.patch.and.returnValue(of(domainReq))

    service.update(domainReq).subscribe(response => {
      expect(response).toEqual(domainReq)
      done()
    })
  })

  it('should return errors on updated domain details when a domain is updated', (done: DoneFn) => {
    const domainReq = {
      profileName: 'testDomain',
      domainSuffix: 'testDomain.com',
      provisioningCert: 'domainCertLongText',
      provisioningCertPassword: 'password',
      provisioningCertStorageFormat: 'string'
    }
    const error = {
      status: 404,
      message: 'Not Found'
    }

    httpClientSpy.patch.and.returnValue(throwError(error))

    service.update(domainReq).subscribe(null, err => {
      expect(error.status).toBe(err[0].status)
      done()
    })
  })

  it('should return the created domain details when a domain is created', (done: DoneFn) => {
    const domainReq = {
      profileName: 'testDomain',
      domainSuffix: 'testDomain.com',
      provisioningCert: 'domainCertLongText',
      provisioningCertPassword: 'password',
      provisioningCertStorageFormat: 'string'
    }

    httpClientSpy.post.and.returnValue(of(domainReq))

    service.create(domainReq).subscribe(response => {
      expect(response).toEqual(domainReq)
      done()
    })
  })

  it('should throw error on created domain details when a domain is created', (done: DoneFn) => {
    const domainReq = {
      profileName: 'testDomain',
      domainSuffix: 'testDomain.com',
      provisioningCert: 'domainCertLongText',
      provisioningCertPassword: 'password',
      provisioningCertStorageFormat: 'string'
    }

    const error = {
      status: 404,
      message: 'Not Found'
    }

    httpClientSpy.post.and.returnValue(throwError(error))

    service.create(domainReq).subscribe(null, err => {
      expect(error.status).toBe(err[0].status)
      done()
    })
  })

  it('should delete the domain when a delete request is sent', (done: DoneFn) => {
    const domainName = 'testDomain'

    httpClientSpy.delete.and.returnValue(of({}))

    service.delete(domainName).subscribe(() => {
      done()
    })

    expect(httpClientSpy.delete.calls.count()).toEqual(1)
  })

  it('should throw error when a delete request is sent', (done: DoneFn) => {
    const domainName = 'testDomain'
    const error = {
      status: 404,
      message: 'Not Found'
    }

    httpClientSpy.delete.and.returnValue(throwError(error))

    service.delete(domainName).subscribe(null, err => {
      expect(error.status).toBe(err[0].status)
      done()
    })

    expect(httpClientSpy.delete.calls.count()).toEqual(1)
  })
})
