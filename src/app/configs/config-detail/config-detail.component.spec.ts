/*********************************************************************
* Copyright (c) Intel Corporation 2022
* SPDX-License-Identifier: Apache-2.0
**********************************************************************/

import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing'
import { BrowserAnimationsModule } from '@angular/platform-browser/animations'
import { ActivatedRoute } from '@angular/router'
import { RouterTestingModule } from '@angular/router/testing'
import { of } from 'rxjs'
import { SharedModule } from 'src/app/shared/shared.module'
import { ConfigsService } from '../configs.service'

import { ConfigDetailComponent } from './config-detail.component'
import { AuthMethods, Config, ServerAddressFormats } from '../configs.constants'

describe('ConfigDetailComponent', () => {
  let component: ConfigDetailComponent
  let fixture: ComponentFixture<ConfigDetailComponent>
  let getRecordSpy: jasmine.Spy
  let updateRecordSpy: jasmine.Spy
  let loadMpsRootCertSpy: jasmine.Spy
  let createRecordSpy: jasmine.Spy
  let config: Config

  beforeEach(async () => {
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
    const configsService = jasmine.createSpyObj('ConfigsService', ['getRecord', 'update', 'loadMPSRootCert', 'create'])
    getRecordSpy = configsService.getRecord.and.returnValue(of({ serverAddressFormat: 3, configName: 'ciraConfig1' }))
    updateRecordSpy = configsService.update.and.returnValue(of({}))
    loadMpsRootCertSpy = configsService.loadMPSRootCert.and.returnValue(of('root certificate'))
    createRecordSpy = configsService.create.and.returnValue(of({}))

    await TestBed.configureTestingModule({
      imports: [BrowserAnimationsModule, SharedModule, RouterTestingModule.withRoutes([])],
      declarations: [ConfigDetailComponent],
      providers: [
        { provide: ConfigsService, useValue: configsService },
        {
          provide: ActivatedRoute,
          useValue: { params: of({ name: 'name' }) }
        }]

    })
      .compileComponents()
  })

  beforeEach(() => {
    fixture = TestBed.createComponent(ConfigDetailComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  afterEach(() => {
    TestBed.resetTestingModule()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
    expect(getRecordSpy.calls.any()).toBe(true, 'getRecord called')
    expect(component.isEdit).toBeTrue()
    expect(component.pageTitle).toEqual('ciraConfig1')
  })

  it('should cancel', async () => {
    const routerSpy = spyOn(component.router, 'navigate')
    await component.cancel()
    expect(routerSpy).toHaveBeenCalledWith(['/ciraconfigs'])
  })

  it('should update the server address format on change', fakeAsync(() => {
    component.configForm.get('serverAddressFormat')?.setValue(ServerAddressFormats.FQDN.value)
    component.configForm.get('serverAddressFormat')?.updateValueAndValidity({ emitEvent: true })
    tick()
    fixture.detectChanges()
    expect(component.configForm.get('commonName')?.value).toEqual(null)
  }))

  it('should set the common name same as server address when format is ip address', fakeAsync(() => {
    const serverAddr = '255.255.255.20'
    component.configForm.get('mpsServerAddress')?.setValue(serverAddr)
    component.configForm.get('mpsServerAddress')?.updateValueAndValidity({ emitEvent: true })
    tick()
    fixture.detectChanges()
    expect(component.configForm.get('commonName')?.value).toEqual(serverAddr)
  }))

  it('should submit when valid(update)', () => {
    const routerSpy = spyOn(component.router, 'navigate')
    component.configForm.patchValue(config)
    expect(component.configForm.valid).toBeTruthy()
    component.onSubmit()
    expect(component.isLoading).toBeFalse()
    expect(loadMpsRootCertSpy).toHaveBeenCalled()
    expect(updateRecordSpy).toHaveBeenCalled()
    expect(routerSpy).toHaveBeenCalled()
  })

  it('should submit when valid(create)', () => {
    const routerSpy = spyOn(component.router, 'navigate')
    component.configForm.patchValue(config)
    component.isEdit = false
    expect(component.configForm.valid).toBeTruthy()
    component.onSubmit()
    expect(component.isLoading).toBeFalse()
    expect(createRecordSpy).toHaveBeenCalled()
    expect(routerSpy).toHaveBeenCalled()
  })
})
