/*********************************************************************
* Copyright (c) Intel Corporation 2021
* SPDX-License-Identifier: Apache-2.0
**********************************************************************/
import { NO_ERRORS_SCHEMA, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core'
import { ComponentFixture, TestBed } from '@angular/core/testing'
import { MatDialog } from '@angular/material/dialog'
import { BrowserAnimationsModule } from '@angular/platform-browser/animations'
import { RouterTestingModule } from '@angular/router/testing'
import { of } from 'rxjs'
import { SharedModule } from '../shared/shared.module'

import { DevicesComponent } from './devices.component'
import { DevicesService } from './devices.service'

describe('DevicesComponent', () => {
  let component: DevicesComponent
  let fixture: ComponentFixture<DevicesComponent>
  let getDevicesSpy: jasmine.Spy
  let getTagsSpy: jasmine.Spy

  beforeEach(async () => {
    const devicesService = jasmine.createSpyObj('DevicesService', ['getDevices', 'getTags'])
    getDevicesSpy = devicesService.getDevices.and.returnValue(of({
      data: [{
        connectionStatus: false,
        guid: 'd12428be-9fa1-4226-9784-54b2038beab6',
        hostname: 'test12',
        mpsInstance: null,
        mpsusername: null,
        tags: ['acm']
      }],
      totalCount: 1
    }))
    getTagsSpy = devicesService.getTags.and.returnValue(of([{ data: [], totalCount: 0 }]))

    await TestBed.configureTestingModule({
      imports: [BrowserAnimationsModule, SharedModule, RouterTestingModule.withRoutes([])],
      declarations: [DevicesComponent],
      schemas: [NO_ERRORS_SCHEMA, CUSTOM_ELEMENTS_SCHEMA],
      providers: [{ provide: DevicesService, useValue: devicesService }]

    })
      .compileComponents()
  })

  beforeEach(() => {
    fixture = TestBed.createComponent(DevicesComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
    expect(getDevicesSpy.calls.any()).toBe(true, 'getDevices called')
    expect(getTagsSpy.calls.any()).toBe(true, 'getTags called')
  })

  it('should open the add device dialog', () => {
    const dialogRefSpyObj = jasmine.createSpyObj({ afterClosed: of(false), close: null })
    const dialogSpy = spyOn(TestBed.get(MatDialog), 'open').and.returnValue(dialogRefSpyObj)

    component.addDevice()
    expect(dialogSpy).toHaveBeenCalled()
  })

  it('should change the page', () => {
    component.pageChanged({ pageSize: 5, pageIndex: 2, length: 20 })
    expect(getDevicesSpy.calls.any()).toBe(true, 'getDevices called')
    expect(component.paginator.length).toBe(1)
    expect(component.paginator.pageSize).toBe(5)
    expect(component.paginator.pageIndex).toBe(0)
    expect(component.paginator.showFirstLastButtons).toBe(true)
  })
})
