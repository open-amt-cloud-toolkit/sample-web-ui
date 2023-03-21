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

import { ProfilesComponent } from './profiles.component'
import { ProfilesService } from './profiles.service'
import { ActivationModes, DhcpModes, Profile, UserConsentModes } from './profiles.constants'

describe('ProfilesComponent', () => {
  let component: ProfilesComponent
  let fixture: ComponentFixture<ProfilesComponent>
  let getDataSpy: jasmine.Spy
  let deleteSpy: jasmine.Spy
  let profile: Profile

  beforeEach(async () => {
    profile = {
      profileName: 'profile1',
      iderEnabled: true,
      kvmEnabled: true,
      solEnabled: true,
      activation: ActivationModes.ADMIN.value,
      userConsent: UserConsentModes.NONE.value,
      generateRandomPassword: false,
      amtPassword: 'P@ssw0rd',
      generateRandomMEBxPassword: false,
      mebxPassword: 'P@ssw0rd',
      ciraConfigName: 'config1',
      dhcpEnabled: DhcpModes.DHCP.value,
      tags: ['acm'],
      wifiConfigs: [{ priority: 1, profileName: 'wifi' }]
    }
    const profilesService = jasmine.createSpyObj('ProfilesService', ['getData', 'delete'])
    getDataSpy = profilesService.getData.and.returnValue(of({
      data: [profile],
      totalCount: 1
    }))
    deleteSpy = profilesService.delete.and.returnValue(of(null))

    await TestBed.configureTestingModule({
      imports: [BrowserAnimationsModule, SharedModule, RouterTestingModule.withRoutes([])],
      declarations: [ProfilesComponent],
      providers: [{ provide: ProfilesService, useValue: profilesService }]
    }).compileComponents()
  })

  beforeEach(() => {
    fixture = TestBed.createComponent(ProfilesComponent)
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

  it('should navigate to new', async () => {
    const routerSpy = spyOn(component.router, 'navigate')
    await component.navigateTo()
    expect(routerSpy).toHaveBeenCalledWith(['/profiles/new'])
  })
  it('should navigate to existing', async () => {
    const routerSpy = spyOn(component.router, 'navigate')
    await component.navigateTo('path')
    expect(routerSpy).toHaveBeenCalledWith(['/profiles/path'])
  })
  it('should delete', () => {
    const dialogRefSpyObj = jasmine.createSpyObj({ afterClosed: of(true), close: null })
    const dialogSpy = spyOn(TestBed.get(MatDialog), 'open').and.returnValue(dialogRefSpyObj)
    const snackBarSpy = spyOn(component.snackBar, 'open')

    component.delete('profile')
    expect(dialogSpy).toHaveBeenCalled()
    fixture.detectChanges()
    expect(dialogRefSpyObj.afterClosed).toHaveBeenCalled()
    expect(deleteSpy).toHaveBeenCalled()
    expect(snackBarSpy).toHaveBeenCalled()
  })
  it('should not delete', () => {
    const dialogRefSpyObj = jasmine.createSpyObj({ afterClosed: of(false), close: null })
    const dialogSpy = spyOn(TestBed.get(MatDialog), 'open').and.returnValue(dialogRefSpyObj)
    const snackBarSpy = spyOn(component.snackBar, 'open')

    component.delete('profile')
    expect(dialogSpy).toHaveBeenCalled()
    fixture.detectChanges()
    expect(dialogRefSpyObj.afterClosed).toHaveBeenCalled()
    expect(deleteSpy).not.toHaveBeenCalledWith()
    expect(snackBarSpy).not.toHaveBeenCalled()
  })
  it('should change the page', () => {
    component.pageChanged({ pageSize: 25, pageIndex: 2, length: 50 })
    expect(getDataSpy.calls.any()).toBe(true, 'getData called')
    expect(component.paginator.length).toBe(1)
    expect(component.paginator.pageSize).toBe(25)
    expect(component.paginator.pageIndex).toBe(0)
    expect(component.paginator.showFirstLastButtons).toBe(true)
  })
})
