/*********************************************************************
* Copyright (c) Intel Corporation 2022
* SPDX-License-Identifier: Apache-2.0
**********************************************************************/

import { ComponentFixture, TestBed } from '@angular/core/testing'
import { MatLegacyDialog as MatDialog } from '@angular/material/legacy-dialog'
import { BrowserAnimationsModule } from '@angular/platform-browser/animations'
import { RouterTestingModule } from '@angular/router/testing'
import { of } from 'rxjs'
import { SharedModule } from '../shared/shared.module'

import { ConfigsComponent } from './configs.component'
import { ConfigsService } from './configs.service'
import { AuthMethods, Config, ServerAddressFormats } from './configs.constants'

describe('ConfigsComponent', () => {
  let component: ConfigsComponent
  let fixture: ComponentFixture<ConfigsComponent>
  let getDataSpy: jasmine.Spy
  let deleteSpy: jasmine.Spy
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

    const configsService = jasmine.createSpyObj('ConfigsService', ['getData', 'delete'])
    getDataSpy = configsService.getData.and.returnValue(of({ data: [config], totalCount: 1 }))
    deleteSpy = configsService.delete.and.returnValue(of(null))
    await TestBed.configureTestingModule({
      imports: [BrowserAnimationsModule, SharedModule, RouterTestingModule.withRoutes([])],
      declarations: [ConfigsComponent],
      providers: [{ provide: ConfigsService, useValue: configsService }]
    })
      .compileComponents()
  })

  beforeEach(() => {
    fixture = TestBed.createComponent(ConfigsComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  afterEach(() => {
    TestBed.resetTestingModule()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
    expect(getDataSpy.calls.any()).toBe(true, 'getData called')
  })

  it('should change the page', () => {
    component.pageChanged({ pageSize: 25, pageIndex: 2, length: 50 })
    expect(getDataSpy.calls.any()).toBe(true, 'getData called')
    expect(component.paginator.length).toBe(1)
    expect(component.paginator.pageSize).toBe(25)
    expect(component.paginator.pageIndex).toBe(0)
    expect(component.paginator.showFirstLastButtons).toBe(true)
  })

  it('should navigate to existing', async () => {
    const routerSpy = spyOn(component.router, 'navigate')
    await component.navigateTo('path')
    expect(routerSpy).toHaveBeenCalledWith(['/ciraconfigs/path'])
  })

  it('should navigate to new', async () => {
    const routerSpy = spyOn(component.router, 'navigate')
    await component.navigateTo()
    expect(routerSpy).toHaveBeenCalledWith(['/ciraconfigs/new'])
  })

  it('should delete', () => {
    const dialogRefSpyObj = jasmine.createSpyObj({ afterClosed: of(true), close: null })
    const dialogSpy = spyOn(TestBed.get(MatDialog), 'open').and.returnValue(dialogRefSpyObj)
    const snackBarSpy = spyOn(component.snackBar, 'open')

    component.delete('ciraconfig1')
    expect(dialogSpy).toHaveBeenCalled()
    fixture.detectChanges()
    expect(dialogRefSpyObj.afterClosed).toHaveBeenCalled()
    expect(deleteSpy).toHaveBeenCalled()
    expect(snackBarSpy).toHaveBeenCalled()
  })
})
