/*********************************************************************
* Copyright (c) Intel Corporation 2021
* SPDX-License-Identifier: Apache-2.0
**********************************************************************/
import { ComponentFixture, TestBed } from '@angular/core/testing'
import { RouterTestingModule } from '@angular/router/testing'
import { KvmComponent } from './kvm.component'

import { DevicesService } from '../devices.service'
import { of } from 'rxjs'
import { SharedModule } from 'src/app/shared/shared.module'
import { ActivatedRoute } from '@angular/router'
import { Component, EventEmitter, Input } from '@angular/core'
import { BrowserAnimationsModule } from '@angular/platform-browser/animations'
import { AuthService } from 'src/app/auth.service'
import { MatDialog } from '@angular/material/dialog'

describe('KvmComponent', () => {
  let component: KvmComponent
  let fixture: ComponentFixture<KvmComponent>
  let setAmtFeaturesSpy: jasmine.Spy
  let powerStateSpy: jasmine.Spy
  let getAMTFeaturesSpy: jasmine.Spy
  let reqUserConsentCodeSpy: jasmine.Spy
  let tokenSpy: jasmine.Spy

  @Component({
    selector: 'app-device-toolbar'
  })
  class TestDeviceToolbarComponent {
    @Input()
    isLoading = false

    @Input()
    deviceState: number = 0
  }

  beforeEach(async () => {
    const devicesService = jasmine.createSpyObj('DevicesService', ['setAmtFeatures', 'getPowerState', 'startwebSocket', 'stopwebSocket', 'getAMTFeatures', 'reqUserConsentCode', 'cancelUserConsentCode'])

    const websocketStub = {
      stopwebSocket: new EventEmitter<boolean>(false),
      connectKVMSocket: new EventEmitter<boolean>(false)
    }
    setAmtFeaturesSpy = devicesService.setAmtFeatures.and.returnValue(of({}))
    getAMTFeaturesSpy = devicesService.getAMTFeatures.and.returnValue(of({}))
    reqUserConsentCodeSpy = devicesService.reqUserConsentCode.and.returnValue(of({}))
    powerStateSpy = devicesService.getPowerState.and.returnValue(of({ powerstate: 2 }))
    const authService = jasmine.createSpyObj('AuthService', ['getLoggedUserToken'])
    tokenSpy = authService.getLoggedUserToken.and.returnValue('123')
    await TestBed.configureTestingModule({
      imports: [SharedModule, BrowserAnimationsModule, RouterTestingModule.withRoutes([])],
      declarations: [KvmComponent, TestDeviceToolbarComponent],
      providers: [{ provide: DevicesService, useValue: { ...devicesService, ...websocketStub } }, {
        provide: ActivatedRoute,
        useValue: {
          params: of({ id: 'guid' })
        }
      }, { provide: AuthService, useValue: authService }]
    })
      .compileComponents()
  })

  beforeEach(() => {
    fixture = TestBed.createComponent(KvmComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
    expect(tokenSpy).toHaveBeenCalled()
    expect(setAmtFeaturesSpy).toHaveBeenCalled()
    expect(powerStateSpy).toHaveBeenCalled()
    expect(getAMTFeaturesSpy).toHaveBeenCalled()
    expect(reqUserConsentCodeSpy).toHaveBeenCalled()
  })

  it('should call userConsentDialog', async () => {
    const dialogRefSpyObj = jasmine.createSpyObj({ afterClosed: of(true), close: null })
    const dialogSpy = spyOn(TestBed.get(MatDialog), 'open').and.returnValue(dialogRefSpyObj)
    await component.userConsentDialog()
    expect(dialogSpy).toHaveBeenCalled()
    fixture.detectChanges()
    expect(dialogRefSpyObj.afterClosed).toHaveBeenCalled()
  })

  it('should call cancelOptInCodeResponse with return value 0', () => {
    const response = {
      Body: { ReturnValue: 0, ReturnValueStr: 'SUCCESS' },
      Header: {
        To: 'string',
        RelatesTo: 'string',
        Action: 'string',
        MessageID: 'string',
        ResourceURI: 'string',
        Method: 'string'
      }
    }
    const snackBarSpy = spyOn(component.snackBar, 'open')
    component.cancelOptInCodeResponse(response)
    fixture.detectChanges()
    expect(snackBarSpy).toHaveBeenCalled()
  })

  it('should call cancelOptInCodeResponse with return value non zero', () => {
    const response = {
      Body: { ReturnValue: 1, ReturnValueStr: 'SUCCESS' },
      Header: {
        To: 'string',
        RelatesTo: 'string',
        Action: 'string',
        MessageID: 'string',
        ResourceURI: 'string',
        Method: 'string'
      }
    }
    const snackBarSpy = spyOn(component.snackBar, 'open')
    component.cancelOptInCodeResponse(response)
    fixture.detectChanges()
    expect(snackBarSpy).toHaveBeenCalled()
  })

  it('should call SendOptInCodeResponse with return value zero', () => {
    const response = {
      Body: { ReturnValue: 0, ReturnValueStr: 'SUCCESS' },
      Header: {
        To: 'string',
        RelatesTo: 'string',
        Action: 'string',
        MessageID: 'string',
        ResourceURI: 'string',
        Method: 'string'
      }
    }
    component.SendOptInCodeResponse(response)
    fixture.detectChanges()
    expect(component.readyToLoadKvm).toBe(true)
  })

  it('should call SendOptInCodeResponse with return value 2066', () => {
    const response = {
      Body: { ReturnValue: 2066, ReturnValueStr: 'SUCCESS' },
      Header: {
        To: 'string',
        RelatesTo: 'string',
        Action: 'string',
        MessageID: 'string',
        ResourceURI: 'string',
        Method: 'string'
      }
    }
    const snackBarSpy = spyOn(component.snackBar, 'open')
    component.SendOptInCodeResponse(response)
    fixture.detectChanges()
    expect(snackBarSpy).toHaveBeenCalled()
  })
  it('should call SendOptInCodeResponse with return value non zero', () => {
    const response = {
      Body: { ReturnValue: 1, ReturnValueStr: 'SUCCESS' },
      Header: {
        To: 'string',
        RelatesTo: 'string',
        Action: 'string',
        MessageID: 'string',
        ResourceURI: 'string',
        Method: 'string'
      }
    }
    const snackBarSpy = spyOn(component.snackBar, 'open')
    component.SendOptInCodeResponse(response)
    fixture.detectChanges()
    expect(snackBarSpy).toHaveBeenCalled()
    expect(component.isLoading).toBeFalsy()
  })
  it('should call afterUserContentDialogClosed with CancelOptIn', () => {
    const response = {
      deviceId: '1234',
      results: {
        Header: {
          To: 'string',
          RelatesTo: 'string',
          Action: 'string',
          MessageID: 'string',
          ResourceURI: 'string',
          Method: 'CancelOptIn'
        },
        Body: {
          ReturnValue: 1, ReturnValueStr: 'SUCCESS'
        }
      }
    }
    spyOn(component, 'cancelUserConsentCode')
    component.afterUserContentDialogClosed(response)
    fixture.detectChanges()
  })

  it('should call afterUserContentDialogClosed with SendOptInCode', () => {
    const response = {
      deviceId: '1234',
      results: {
        Header: {
          Method: 'SendOptInCode'
        }
      }
    }
    component.afterUserContentDialogClosed(response)
  })

  it('should call deviceStatus with device status 2', () => {
    component.deviceStatus(2)
    fixture.detectChanges()
    expect(component.isLoading).toBeFalsy()
    expect(component.deviceState).toBe(2)
  })

  it('should call deviceStatus with device status 0', () => {
    component.deviceStatus(0)
    fixture.detectChanges()
    expect(component.deviceState).toBe(0)
  })
  it('should call onEncodingChange', () => {
    spyOn(component.selectedEncoding, 'emit')
    component.onEncodingChange(2)
    fixture.detectChanges()
    expect(component.selectedEncoding.emit).toHaveBeenCalledWith(2)
  })
})
