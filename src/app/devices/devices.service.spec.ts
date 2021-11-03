/*********************************************************************
* Copyright (c) Intel Corporation 2021
* SPDX-License-Identifier: Apache-2.0
**********************************************************************/
import { TestBed } from '@angular/core/testing'
import { Router } from '@angular/router'
import { of, throwError } from 'rxjs'
import { AuthService } from '../auth.service'

import { DevicesService } from './devices.service'

describe('DevicesService', () => {
  let service: DevicesService
  let httpClientSpy: { get: jasmine.Spy, post: jasmine.Spy, patch: jasmine.Spy, delete: jasmine.Spy }
  let routerSpy
  beforeEach(() => {
    httpClientSpy = jasmine.createSpyObj('HttpClient', ['get', 'post', 'delete', 'patch'])
    routerSpy = jasmine.createSpyObj('Router', ['navigate'])
    TestBed.configureTestingModule({
      imports: [AuthService]
    })
    service = new DevicesService(new AuthService(httpClientSpy as any, routerSpy as Router), httpClientSpy as any)
  })

  it('should be created', () => {
    expect(service).toBeTruthy()
  })

  it('should return all the devices when requested for all devices', (done: DoneFn) => {
    const deviceResponse = [{
      hostname: 'localhost',
      icon: 1,
      connectionStatus: false,
      guid: '1234-dedfg-9873-1234',
      tags: []

    }]
    httpClientSpy.post.and.returnValue(of(deviceResponse))
    service.getData().subscribe(response => {
      expect(response).toEqual(deviceResponse)
      done()
    })
  })

  it('should return errors when requested for all devices', (done: DoneFn) => {
    const error = {
      status: 404,
      message: 'Not Found'
    }
    httpClientSpy.post.and.returnValue(throwError(error))
    service.getData().subscribe(null, err => {
      expect(error).toEqual(err)
      done()
    })
  })

  it('should return all the tags when requested for all tags', (done: DoneFn) => {
    const deviceResponse = ['test']
    httpClientSpy.get.and.returnValue(of(deviceResponse))
    service.getTags().subscribe(response => {
      expect(response).toEqual(deviceResponse)
      done()
    })
  })

  it('should return errors when requested for all tags', (done: DoneFn) => {
    const error = {
      status: 404,
      message: 'Not Found'
    }
    httpClientSpy.get.and.returnValue(throwError(error))
    service.getTags().subscribe(null, err => {
      expect(error).toEqual(err)
      done()
    })
  })

  it('should return all the device when requested for device', (done: DoneFn) => {
    const deviceResponse = {
      hostname: 'localhost',
      icon: 1,
      connectionStatus: true,
      guid: 'defgh-34567-poiuy',
      tags: []
    }
    httpClientSpy.get.and.returnValue(of(deviceResponse))
    service.getDevice(deviceResponse.guid).subscribe(response => {
      expect(response).toEqual(deviceResponse)
      done()
    })
  })

  it('should return errors when requested for device', (done: DoneFn) => {
    const error = {
      status: 404,
      message: 'Not Found'
    }
    httpClientSpy.get.and.returnValue(throwError(error))
    service.getDevice('defgh-34567-poiuy').subscribe(null, err => {
      expect(error).toEqual(err)
      done()
    })
  })

  it('should return all the devices when requested for devices', (done: DoneFn) => {
    const deviceResponse = {
      data: [{
        hostname: 'localhost',
        icon: 1,
        connectionStatus: true,
        guid: 'defgh-34567-poiuy',
        tags: []
      }],
      totalCount: 1
    }
    httpClientSpy.get.and.returnValue(of(deviceResponse))
    service.getDevices({ pageSize: 25, startsFrom: 0, count: 'true' }).subscribe(response => {
      expect(response).toEqual(deviceResponse)
      done()
    })
  })

  it('should return all the devices when requested for devices with tags', (done: DoneFn) => {
    const deviceResponse = {
      data: [{
        hostname: 'localhost',
        icon: 1,
        connectionStatus: true,
        guid: 'defgh-34567-poiuy',
        tags: []
      }],
      totalCount: 1
    }
    httpClientSpy.get.and.returnValue(of(deviceResponse))
    service.getDevices({ pageSize: 25, startsFrom: 0, count: 'true', tags: ['test'] }).subscribe(response => {
      expect(response).toEqual(deviceResponse)
      done()
    })
  })

  it('should return errors when requested for devices', (done: DoneFn) => {
    const error = {
      status: 404,
      message: 'Not Found'
    }
    httpClientSpy.get.and.returnValue(throwError(error))
    service.getDevices({ pageSize: 25, startsFrom: 0, count: 'true' }).subscribe(null, err => {
      expect(error).toEqual(err)
      done()
    })
  })

  it('should return all the Set Amt Features when requested for Set Amt Features', (done: DoneFn) => {
    const deviceResponse = {
      userConsent: 'kVM',
      optInState: 2,
      redirection: true,
      KVM: true,
      SOL: true,
      IDER: true
    }
    httpClientSpy.post.and.returnValue(of(deviceResponse))
    service.setAmtFeatures('defgh-34567-poiuy').subscribe(response => {
      expect(response).toEqual(deviceResponse)
      done()
    })
  })

  it('should return errors when requested for devices', (done: DoneFn) => {
    const error = {
      status: 404,
      message: 'Not Found'
    }
    httpClientSpy.post.and.returnValue(throwError(error))
    service.setAmtFeatures('defgh-34567-poiuy').subscribe(null, err => {
      expect(error).toEqual(err)
      done()
    })
  })

  it('should return power state when requested for power state', (done: DoneFn) => {
    const powerState = {
      powerstate: 2
    }
    httpClientSpy.get.and.returnValue(of(powerState))
    service.getPowerState('defgh-34567-poiuy').subscribe(response => {
      expect(powerState.powerstate).toBe(response.powerstate)
      done()
    })
  })

  it('should return errors when requested for power state', (done: DoneFn) => {
    const error = {
      status: 404,
      message: 'Not Found'
    }
    httpClientSpy.get.and.returnValue(throwError(error))
    service.getPowerState('defgh-34567-poiuy').subscribe(null, err => {
      expect(error).toEqual(err)
      done()
    })
  })

  it('should return device stats when requested for device stats', (done: DoneFn) => {
    const deviceStats = {
      totalCount: 1,
      connectedCount: 1,
      disconnectedCount: 0
    }
    httpClientSpy.get.and.returnValue(of(deviceStats))
    service.getStats().subscribe(response => {
      expect(response).toEqual(deviceStats)
      done()
    })
  })

  it('should return errors when requested for device stats', (done: DoneFn) => {
    const error = {
      status: 404,
      message: 'Not Found'
    }
    httpClientSpy.get.and.returnValue(throwError(error))
    service.getStats().subscribe(null, err => {
      expect(error).toEqual(err)
      done()
    })
  })

  it('should return requserconsentcode  when requested for requserconsentcode', (done: DoneFn) => {
    const userConsentresponse = {
      Header: {
        To: 'string',
        RelatesTo: 'string',
        Action: 'string',
        MessageID: 'string',
        ResourceURI: 'string',
        Method: 'string'
      },
      Body: {
        ReturnValue: [{
          hostname: 'localhost',
          icon: 1,
          connectionStatus: true,
          guid: 'defgh-34567-poiuy',
          tags: []
        }],
        ReturnValueStr: 'SUCCESS'
      }
    }
    httpClientSpy.get.and.returnValue(of(userConsentresponse))
    service.reqUserConsentCode('defgh-34567-poiuy').subscribe(response => {
      expect(JSON.stringify(response)).toContain(JSON.stringify(userConsentresponse))
      done()
    })
  })

  it('should return errors when requested for requserconsentcode', (done: DoneFn) => {
    const error = {
      status: 404,
      message: 'Not Found'
    }
    httpClientSpy.get.and.returnValue(throwError(error))
    service.reqUserConsentCode('defgh-34567-poiuy').subscribe(null, err => {
      expect(error).toEqual(err)
      done()
    })
  })

  it('should return cancelUserConsentCode when requested for cancelUserConsentCode', (done: DoneFn) => {
    const cancelConsentresponse = {
      Header: {
        To: 'string',
        RelatesTo: 'string',
        Action: 'string',
        MessageID: 'string',
        ResourceURI: 'string',
        Method: 'string'
      },
      Body: {
        ReturnValue: [{
          hostname: 'localhost',
          icon: 1,
          connectionStatus: true,
          guid: 'defgh-34567-poiuy',
          tags: []
        }],
        ReturnValueStr: 'SUCCESS'
      }
    }
    httpClientSpy.get.and.returnValue(of(cancelConsentresponse))
    service.cancelUserConsentCode('defgh-34567-poiuy').subscribe(response => {
      expect(JSON.stringify(response)).toContain(JSON.stringify(cancelConsentresponse))
      done()
    })
  })

  it('should return errors when requested for requserconsentcode', (done: DoneFn) => {
    const error = {
      status: 404,
      message: 'Not Found'
    }
    httpClientSpy.get.and.returnValue(throwError(error))
    service.cancelUserConsentCode('defgh-34567-poiuy').subscribe(null, err => {
      expect(error).toEqual(err)
      done()
    })
  })

  it('should return sendUserConsentCode when requested for sendUserConsentCode', (done: DoneFn) => {
    const sendUserConsentCode = {
      Header: {
        To: 'string',
        RelatesTo: 'string',
        Action: 'string',
        MessageID: 'string',
        ResourceURI: 'string',
        Method: 'string'
      },
      Body: {
        ReturnValue: [{
          hostname: 'localhost',
          icon: 1,
          connectionStatus: true,
          guid: 'defgh-34567-poiuy',
          tags: []
        }],
        ReturnValueStr: 'SUCCESS'
      }
    }
    httpClientSpy.post.and.returnValue(of(sendUserConsentCode))
    service.sendUserConsentCode('defgh-34567-poiuy', 2).subscribe(response => {
      expect(JSON.stringify(response)).toContain(JSON.stringify(sendUserConsentCode))
      done()
    })
  })

  it('should return errors when requested for sendUserConsentCode', (done: DoneFn) => {
    const error = {
      status: 404,
      message: 'Not Found'
    }
    httpClientSpy.post.and.returnValue(throwError(error))
    service.sendUserConsentCode('defgh-34567-poiuy', 2).subscribe(null, err => {
      expect(error).toEqual(err)
      done()
    })
  })

  it('should return AMT Version when requested for AMT Version', (done: DoneFn) => {
    const amtVersion = {
      amtVersion: 2
    }
    httpClientSpy.get.and.returnValue(of(amtVersion))
    service.getAMTVersion('defgh-34567-poiuy').subscribe(response => {
      expect(amtVersion.amtVersion).toBe(response.amtVersion)
      done()
    })
  })

  it('should return errors when requested for power state', (done: DoneFn) => {
    const error = {
      status: 404,
      message: 'Not Found'
    }
    httpClientSpy.get.and.returnValue(throwError(error))
    service.getAMTVersion('defgh-34567-poiuy').subscribe(null, err => {
      expect(error).toEqual(err)
      done()
    })
  })

  it('should return all the Audit Log when requested for Audit Log', (done: DoneFn) => {
    const auditLogResponse = {
      totalCnt: 1,
      records: [{
        AuditApp: 'string',
        AuditAppID: 1234,
        Event: 'logs',
        EventID: 12345,
        Ex: 'string',
        ExStr: 'string',
        Initiator: 'string',
        InitiatorType: 1234,
        MCLocationType: 1234,
        NetAddress: 'string',
        Time: 'string'
      }]
    }
    httpClientSpy.get.and.returnValue(of(auditLogResponse))
    service.getAuditLog('defgh-34567-poiuy').subscribe(response => {
      expect(response).toEqual(auditLogResponse)
      done()
    })
  })

  it('should return errors when requested for Audit Log', (done: DoneFn) => {
    const error = {
      status: 404,
      message: 'Not Found'
    }
    httpClientSpy.get.and.returnValue(throwError(error))
    service.getAuditLog('defgh-34567-poiuy').subscribe(null, err => {
      expect(error).toEqual(err)
      done()
    })
  })

  it('should return all the Event Log when requested for Event Log', (done: DoneFn) => {
    const eventLogResponse = [{
      DeviceAddress: 123456,
      EventSensorType: 45678,
      EventType: 45,
      EventOffset: 23,
      EventSourceType: 2,
      EventSeverity: 5,
      SensorNumber: 1,
      Entity: 1,
      EntityInstance: 2,
      EventData: [1, 2, 3, 4],
      Time: 'string',
      EntityStr: 'string',
      Desc: 'string',
      eventTypeDesc: 'string'
    }]
    httpClientSpy.get.and.returnValue(of(eventLogResponse))
    service.getEventLog('defgh-34567-poiuy').subscribe(response => {
      expect(response).toEqual(eventLogResponse)
      done()
    })
  })

  it('should return errors when requested for Event Log', (done: DoneFn) => {
    const error = {
      status: 404,
      message: 'Not Found'
    }
    httpClientSpy.get.and.returnValue(throwError(error))
    service.getEventLog('defgh-34567-poiuy').subscribe(null, err => {
      expect(error).toEqual(err)
      done()
    })
  })

  it('should return all the Amt Features when requested for Amt Features', (done: DoneFn) => {
    const amtFeaturesResponse = {
      userConsent: 'KVM',
      optInState: 2,
      redirection: true,
      KVM: true,
      SOL: true,
      IDER: true
    }
    httpClientSpy.get.and.returnValue(of(amtFeaturesResponse))
    service.getAMTFeatures('defgh-34567-poiuy').subscribe(response => {
      expect(response).toEqual(amtFeaturesResponse)
      done()
    })
  })

  it('should return errors when requested for Amt Features', (done: DoneFn) => {
    const error = {
      status: 404,
      message: 'Not Found'
    }
    httpClientSpy.get.and.returnValue(throwError(error))
    service.getAMTFeatures('defgh-34567-poiuy').subscribe(null, err => {
      expect(error).toEqual(err)
      done()
    })
  })

  it('should send power action', (done: DoneFn) => {
    const sendPowerAction = {
      Header: {
        To: 'string',
        RelatesTo: 'string',
        Action: 'string',
        MessageID: 'string',
        ResourceURI: 'string',
        Method: 'string'
      },
      Body: {
        ReturnValue: [{
          hostname: 'localhost',
          icon: 1,
          connectionStatus: true,
          guid: 'defgh-34567-poiuy',
          tags: []
        }],
        ReturnValueStr: 'SUCCESS'
      }
    }
    httpClientSpy.post.and.returnValue(of(sendPowerAction))
    service.sendPowerAction('defgh-34567-poiuy', 2).subscribe(response => {
      expect(response).toEqual(sendPowerAction)
      done()
    })
  })

  it('should return errors when requested send power action', (done: DoneFn) => {
    const error = {
      status: 404,
      message: 'Not Found'
    }
    httpClientSpy.post.and.returnValue(throwError(error))
    service.sendPowerAction('defgh-34567-poiuy', 2).subscribe(null, err => {
      expect(error).toEqual(err)
      done()
    })
  })
})
