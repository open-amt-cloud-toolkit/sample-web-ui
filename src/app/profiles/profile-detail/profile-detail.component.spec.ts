/*********************************************************************
* Copyright (c) Intel Corporation 2022
* SPDX-License-Identifier: Apache-2.0
**********************************************************************/

import { ComponentFixture, TestBed } from '@angular/core/testing'
import { BrowserAnimationsModule } from '@angular/platform-browser/animations'
import { ActivatedRoute } from '@angular/router'
import { MatLegacyDialog as MatDialog } from '@angular/material/legacy-dialog'
import { RouterTestingModule } from '@angular/router/testing'
import { of } from 'rxjs'
import { ConfigsService } from 'src/app/configs/configs.service'
import { SharedModule } from 'src/app/shared/shared.module'
import { WirelessService } from 'src/app/wireless/wireless.service'
import * as Wireless from 'src/app/wireless/wireless.constants'
import { ProfilesService } from '../profiles.service'
import * as IEEE8021x from 'src/app/ieee8021x/ieee8021x.constants'
import { IEEE8021xService } from 'src/app/ieee8021x/ieee8021x.service'

import { ProfileDetailComponent } from './profile-detail.component'
import {
  ActivationModes,
  ConnectionModes,
  DhcpModes,
  Profile,
  TlsModes,
  TlsSigningAuthorities,
  UserConsentModes
} from '../profiles.constants'

describe('ProfileDetailComponent', () => {
  let component: ProfileDetailComponent
  let fixture: ComponentFixture<ProfileDetailComponent>
  let profileSpy: jasmine.Spy
  let configsSpy: jasmine.Spy
  let profileCreateSpy: jasmine.Spy
  let profileUpdateSpy: jasmine.Spy
  const ieee8021xAvailableConfigs: IEEE8021x.Config[] = [
    {
      profileName: '8021x-config-1',
      authenticationProtocol: IEEE8021x.AuthenticationProtocols.EAP_TLS.value,
      pxeTimeout: 120,
      wiredInterface: true,
      version: ''
    },
    {
      profileName: '8021x-config-2',
      authenticationProtocol: IEEE8021x.AuthenticationProtocols.EAP_TLS.value,
      pxeTimeout: 120,
      wiredInterface: false,
      version: ''
    },
    {
      profileName: '8021x-config-3',
      authenticationProtocol: IEEE8021x.AuthenticationProtocols.EAP_TLS.value,
      pxeTimeout: 120,
      wiredInterface: false,
      version: ''
    }
  ]
  let ieee8021xConfigsSpy: jasmine.Spy
  const wirelessAvailableConfigs: Wireless.Config[] = [
    {
      profileName: 'wireless01',
      authenticationMethod: Wireless.AuthenticationMethods.WPA_PSK.value,
      pskPassphrase: 'ABCDEF0123456789',
      encryptionMethod: Wireless.EncryptionMethods.TKIP.value,
      ssid: 'thisisthessid'
    },
    {
      profileName: 'wireless02',
      authenticationMethod: Wireless.AuthenticationMethods.WPA_IEEE8021X.value,
      ieee8021xProfileName: ieee8021xAvailableConfigs[1].profileName,
      encryptionMethod: Wireless.EncryptionMethods.TKIP.value,
      ssid: 'thisisthessid'
    }
  ]
  let wirelessConfigsSpy: jasmine.Spy
  // let tlsConfigSpy: jasmine.Spy
  beforeEach(async () => {
    const profilesService = jasmine.createSpyObj('ProfilesService', ['getRecord', 'update', 'create'])
    const configsService = jasmine.createSpyObj('ConfigsService', ['getData'])
    const ieee8021xService = jasmine.createSpyObj('IEEE8021xService', ['getData'])
    const wirelessService = jasmine.createSpyObj('WirelessService', ['getData'])
    // const tlsService = jasmine.createSpyObj('TLSService', ['getData'])

    profileSpy = profilesService.getRecord.and.returnValue(of(profile))
    profileCreateSpy = profilesService.create.and.returnValue(of({}))
    profileUpdateSpy = profilesService.update.and.returnValue(of({}))
    configsSpy = configsService.getData.and.returnValue(of({ data: [{ profileName: '' }], totalCount: 0 }))
    ieee8021xConfigsSpy = ieee8021xService.getData.and.returnValue(of(
      { data: ieee8021xAvailableConfigs, totalCount: ieee8021xAvailableConfigs.length }
    ))
    wirelessConfigsSpy = wirelessService.getData.and.returnValue(of(
      { data: wirelessAvailableConfigs, totalCount: wirelessAvailableConfigs.length }
    ))
    await TestBed.configureTestingModule({
      imports: [BrowserAnimationsModule, SharedModule, RouterTestingModule.withRoutes([])],
      declarations: [ProfileDetailComponent],
      providers: [
        { provide: ProfilesService, useValue: profilesService },
        { provide: ConfigsService, useValue: configsService },
        { provide: IEEE8021xService, useValue: ieee8021xService },
        { provide: WirelessService, useValue: wirelessService },
        {
          provide: ActivatedRoute,
          useValue: {
            params: of({ name: 'profile' })
          }
        }
      ]
    }).compileComponents()
  })
  let profile: Profile

  beforeEach(() => {
    fixture = TestBed.createComponent(ProfileDetailComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
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
      ieee8021xProfileName: ieee8021xAvailableConfigs[0].profileName,
      wifiConfigs: [{ priority: 1, profileName: 'wifi' }]
    }
  })

  afterEach(() => {
    TestBed.resetTestingModule()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
    expect(configsSpy).toHaveBeenCalled()
    expect(profileSpy).toHaveBeenCalledWith('profile')
    expect(ieee8021xConfigsSpy).toHaveBeenCalled()
    expect(wirelessConfigsSpy).toHaveBeenCalled()
  })
  it('should set connectionMode to TLS when tlsMode is not null', () => {
    profile.tlsMode = TlsModes.SERVER.value
    profile.ciraConfigName = 'someOtherName'
    component.setConnectionMode(profile)
    expect(component.connectionMode.value).toBe(ConnectionModes.TLS.value)
  })
  it('should set connectionMode to CIRA when ciraConfigName is not null', () => {
    delete profile.tlsMode
    profile.ciraConfigName = 'someOtherName'
    component.setConnectionMode(profile)
    expect(component.connectionMode.value).toBe(ConnectionModes.CIRA.value)
  })
  it('should cancel', async () => {
    const routerSpy = spyOn(component.router, 'navigate')
    await component.cancel()
    expect(routerSpy).toHaveBeenCalledWith(['/profiles'])
  })
  it(`should not enable mebxPassword when generateRandomMEBxPassword is false and activation is ${ActivationModes.CLIENT.label}`, () => {
    profile.activation = ActivationModes.CLIENT.value
    profile.generateRandomMEBxPassword = false
    component.profileForm.patchValue(profile)
    expect(component.profileForm.controls.mebxPassword.disabled).toBeTrue()
    component.generateRandomMEBxPasswordChange(false)
    expect(component.profileForm.controls.mebxPassword.disabled).toBeTrue()
  })
  it('should disable mebxPassword when generateRandomMEBxPassword is true', () => {
    component.profileForm.patchValue({
      activation: ActivationModes.ADMIN.value,
      generateRandomMEBxPassword: false
    })
    expect(component.profileForm.controls.mebxPassword.disabled).toBeFalse()
    component.generateRandomMEBxPasswordChange(true)
    expect(component.profileForm.controls.mebxPassword.disabled).toBeTrue()
  })
  it('should enable amtPassword when generateRandomPassword is false', () => {
    component.profileForm.patchValue({ generateRandomPassword: true })
    expect(component.profileForm.controls.amtPassword.disabled).toBeTrue()
    component.generateRandomPasswordChange(false)
    expect(component.profileForm.controls.amtPassword.disabled).toBeFalse()
  })
  it('should disable amtPassword when generateRandomPassword is true', () => {
    component.profileForm.patchValue({ generateRandomPassword: false })
    expect(component.profileForm.controls.amtPassword.disabled).toBeFalse()
    component.profileForm.patchValue({ generateRandomPassword: true })
    expect(component.profileForm.controls.amtPassword.disabled).toBeTrue()
  })

  it('should submit when valid (update)', () => {
    const routerSpy = spyOn(component.router, 'navigate')
    component.profileForm.patchValue(profile)
    component.confirm()
    expect(profileUpdateSpy).toHaveBeenCalled()
    expect(routerSpy).toHaveBeenCalled()
  })
  it('should submit when valid (create)', () => {
    const routerSpy = spyOn(component.router, 'navigate')
    component.isEdit = false
    component.profileForm.patchValue(profile)
    component.confirm()
    expect(profileCreateSpy).toHaveBeenCalled()
    expect(routerSpy).toHaveBeenCalled()
  })

  it('should submit when valid with random passwords (create)', () => {
    const routerSpy = spyOn(component.router, 'navigate')
    const dialogRefSpyObj = jasmine.createSpyObj({ afterClosed: of(true), close: null })
    const dialogSpy = spyOn(TestBed.get(MatDialog), 'open').and.returnValue(dialogRefSpyObj)
    component.isEdit = false
    const patchedProfile: Profile = {
     ...profile,
      generateRandomPassword: true,
      amtPassword: '',
      generateRandomMEBxPassword: true,
      mebxPassword: ''
    }
    component.profileForm.patchValue(patchedProfile)
    component.confirm()
    expect(dialogSpy).toHaveBeenCalled()
    expect(dialogRefSpyObj.afterClosed).toHaveBeenCalled()
    expect(profileCreateSpy).toHaveBeenCalled()
    expect(routerSpy).toHaveBeenCalled()
  })

  it('should cancel submit with random passwords', () => {
    const routerSpy = spyOn(component.router, 'navigate')
    const dialogRefSpyObj = jasmine.createSpyObj({ afterClosed: of(false), close: null })
    const dialogSpy = spyOn(TestBed.get(MatDialog), 'open').and.returnValue(dialogRefSpyObj)
    component.isEdit = false
    const patchedProfile: Profile = {
     ...profile,
      generateRandomPassword: true,
      amtPassword: '',
      generateRandomMEBxPassword: true,
      mebxPassword: ''
    }
    component.profileForm.patchValue(patchedProfile)
    component.confirm()
    expect(dialogSpy).toHaveBeenCalled()
    expect(dialogRefSpyObj.afterClosed).toHaveBeenCalled()
    expect(profileCreateSpy).not.toHaveBeenCalled()
    expect(routerSpy).not.toHaveBeenCalled()
  })

  it('should enable the cira config and disable wifi config when static network is selected', () => {
    component.dhcpChanged(false)
    expect(component.profileForm.controls.ciraConfigName.enabled).toBe(true)
    // Add check for wifi config disabled or selected wifi config is 0
  })

  it('should submit if cira config and static network are simultaneously selected and user confirms', () => {
    const routerSpy = spyOn(component.router, 'navigate')
    const dialogRefSpyObj = jasmine.createSpyObj({ afterClosed: of(true), close: null })
    const dialogSpy = spyOn(TestBed.get(MatDialog), 'open').and.returnValue(dialogRefSpyObj)
    component.isEdit = false
    const patchedProfile: Profile = {
     ...profile,
      dhcpEnabled: DhcpModes.STATIC.value
    }
    component.profileForm.patchValue(patchedProfile)
    component.confirm()
    expect(dialogSpy).toHaveBeenCalled()
    expect(dialogRefSpyObj.afterClosed).toHaveBeenCalled()
    expect(profileCreateSpy).toHaveBeenCalled()
    expect(routerSpy).toHaveBeenCalled()
  })

  it('should cancel submit if cira config and static network are simultaneously selected and user cancels', () => {
    const routerSpy = spyOn(component.router, 'navigate')
    const dialogRefSpyObj = jasmine.createSpyObj({ afterClosed: of(false), close: null })
    const dialogSpy = spyOn(TestBed.get(MatDialog), 'open').and.returnValue(dialogRefSpyObj)
    component.isEdit = false
    const patchedProfile: Profile = {
     ...profile,
      dhcpEnabled: DhcpModes.STATIC.value
    }
    component.profileForm.patchValue(patchedProfile)
    component.confirm()
    expect(dialogSpy).toHaveBeenCalled()
    expect(dialogRefSpyObj.afterClosed).toHaveBeenCalled()
    expect(profileCreateSpy).not.toHaveBeenCalled()
    expect(routerSpy).not.toHaveBeenCalled()
  })

  it('should submit if cira config and static network are simultaneously selected + randomly generated password and user confirms', () => {
    const routerSpy = spyOn(component.router, 'navigate')
    const dialogRefSpyObj = jasmine.createSpyObj({ afterClosed: of(true), close: null })
    const dialogSpy = spyOn(TestBed.get(MatDialog), 'open').and.returnValue(dialogRefSpyObj)
    component.isEdit = false
    const patchedProfile: Profile = {
     ...profile,
      generateRandomPassword: true,
      amtPassword: '',
      generateRandomMEBxPassword: true,
      mebxPassword: '',
      dhcpEnabled: DhcpModes.STATIC.value
    }
    component.profileForm.patchValue(patchedProfile)
    component.confirm()
    expect(dialogSpy).toHaveBeenCalled()
    expect(dialogRefSpyObj.afterClosed).toHaveBeenCalled()
    expect(profileCreateSpy).toHaveBeenCalled()
    expect(routerSpy).toHaveBeenCalled()
  })

  it('should cancel submit if cira config and static network are simultaneously selected + randomly generated password and user cancels dialog', () => {
    const routerSpy = spyOn(component.router, 'navigate')
    const dialogRefSpyObj = jasmine.createSpyObj({ afterClosed: of(false), close: null })
    const dialogSpy = spyOn(TestBed.get(MatDialog), 'open').and.returnValue(dialogRefSpyObj)
    component.isEdit = false
    const patchedProfile: Profile = {
     ...profile,
      generateRandomPassword: true,
      amtPassword: '',
      generateRandomMEBxPassword: true,
      mebxPassword: '',
      dhcpEnabled: DhcpModes.STATIC.value
    }
    component.profileForm.patchValue(patchedProfile)
    component.confirm()
    expect(dialogSpy).toHaveBeenCalled()
    expect(dialogRefSpyObj.afterClosed).toHaveBeenCalled()
    expect(profileCreateSpy).not.toHaveBeenCalled()
    expect(routerSpy).not.toHaveBeenCalled()
  })

  it('should submit when valid with only random mebx password + ccm activation', () => {
    const routerSpy = spyOn(component.router, 'navigate')
    const dialogRefSpyObj = jasmine.createSpyObj({ afterClosed: of(true), close: null })
    const dialogSpy = spyOn(TestBed.get(MatDialog), 'open').and.returnValue(dialogRefSpyObj)
    component.isEdit = false
    const patchedProfile: Profile = {
     ...profile,
      activation: ActivationModes.CLIENT.value,
      generateRandomMEBxPassword: true,
      mebxPassword: '',
      wifiConfigs: []
    }
    delete patchedProfile.ciraConfigName
    component.profileForm.patchValue(patchedProfile)
    component.confirm()
    expect(dialogSpy).toHaveBeenCalled()
    expect(dialogRefSpyObj.afterClosed).toHaveBeenCalled()
    expect(profileCreateSpy).toHaveBeenCalled()
    expect(routerSpy).toHaveBeenCalled()
  })

  it('should submit if cira config and static network are simultaneously selected + only random mebx password + ccm activation', () => {
    const routerSpy = spyOn(component.router, 'navigate')
    const dialogRefSpyObj = jasmine.createSpyObj({ afterClosed: of(true), close: null })
    const dialogSpy = spyOn(TestBed.get(MatDialog), 'open').and.returnValue(dialogRefSpyObj)
    component.isEdit = false
    const patchedProfile: Profile = {
     ...profile,
      activation: ActivationModes.CLIENT.value,
      generateRandomMEBxPassword: true,
      mebxPassword: '',
      dhcpEnabled: DhcpModes.STATIC.value
    }
    component.profileForm.patchValue(patchedProfile)
    component.confirm()
    expect(dialogSpy).toHaveBeenCalled()
    expect(dialogRefSpyObj.afterClosed).toHaveBeenCalled()
    expect(profileCreateSpy).toHaveBeenCalled()
    expect(routerSpy).toHaveBeenCalled()
  })

  it('should cancel submit if cira config and static network are simultaneously selected + only random mebx password + ccm activation', () => {
    const routerSpy = spyOn(component.router, 'navigate')
    const dialogRefSpyObj = jasmine.createSpyObj({ afterClosed: of(false), close: null })
    const dialogSpy = spyOn(TestBed.get(MatDialog), 'open').and.returnValue(dialogRefSpyObj)
    component.isEdit = false
    const patchedProfile: Profile = {
      ...profile,
      activation: ActivationModes.CLIENT.value,
      generateRandomMEBxPassword: true,
      mebxPassword: '',
      dhcpEnabled: DhcpModes.STATIC.value
    }
    component.profileForm.patchValue(patchedProfile)
    component.confirm()
    expect(dialogSpy).toHaveBeenCalled()
    expect(dialogRefSpyObj.afterClosed).toHaveBeenCalled()
    expect(profileCreateSpy).not.toHaveBeenCalled()
    expect(routerSpy).not.toHaveBeenCalled()
  })

  it('should update the selected wifi configs on selecting a wifi profile', () => {
    component.selectedWifiConfigs = [{ priority: 1, profileName: 'home' }]
    const option: any = {
      option: {
        value: 'work'
      }
    }
    component.selectWifiProfile(option)
    expect(component.selectedWifiConfigs.length).toBe(2)
  })

  it('should update the selected wifi configs when a selected config is removed', () => {
    component.selectedWifiConfigs = [{ priority: 1, profileName: 'home' }, { priority: 2, profileName: 'work' }]
    const item: any = {
      priority: 2,
      profileName: 'work'
    }
    component.removeWifiProfile(item)
    expect(component.selectedWifiConfigs.length).toBe(2)
  })

  it('should adjust related fields on selecting activation mode', () => {
    component.activationChange(ActivationModes.CLIENT.value)
    expect(component.profileForm.controls.generateRandomMEBxPassword.disabled).toBe(true)
    expect(component.profileForm.controls.userConsent.disabled).toBe(true)
    expect(component.profileForm.controls.userConsent.value).toEqual(UserConsentModes.ALL.value)
    component.activationChange(ActivationModes.ADMIN.value)
    expect(component.profileForm.controls.generateRandomMEBxPassword.disabled).toBe(false)
    expect(component.profileForm.controls.userConsent.disabled).toBe(false)
  })

  it('should return the search results when a search string is entered', () => {
    component.wirelessConfigurations = ['homeWiFi', 'officeWiFi']
    const searchString = 'home'
    const results = component.search(searchString)
    expect(results).toEqual(['homeWiFi'])
  })

  it('should update the list of tags when a tag is removed ', () => {
    component.tags = ['acm', 'ccm', 'profile']
    const tagName = 'ccm'
    component.remove(tagName)
    expect(component.tags).toEqual(['acm', 'profile'])
  })

  it('should turn amt visibility on when it is off', () => {
    component.amtInputType = 'password'
    component.toggleAMTPassVisibility()
    expect(component.amtInputType).toEqual('text')
  })

  it('should turn amt visibility off when it is on', () => {
    component.amtInputType = 'text'
    component.toggleAMTPassVisibility()
    expect(component.amtInputType).toEqual('password')
  })

  it('should turn mebx visibility on when it is off', () => {
    component.mebxInputType = 'password'
    component.toggleMEBXPassVisibility()
    expect(component.mebxInputType).toEqual('text')
  })

  it('should turn mebx visibility off when it is on', () => {
    component.mebxInputType = 'text'
    component.toggleMEBXPassVisibility()
    expect(component.mebxInputType).toEqual('password')
  })

  it('should generate a random password without a specified length', () => {
    const password = component.generateRandomPassword()
    expect(password).toBeDefined()
    expect(password.length).toBe(16)
  })

  it('should generate a random password with specified length', () => {
    const password = component.generateRandomPassword(10)
    expect(password).toBeDefined()
    expect(password.length).toBe(10)
  })

  it('should change the value of amt password to a random strong password', () => {
    component.profileForm.controls.amtPassword.setValue('')
    component.GenerateAMTPassword()
    expect(component.profileForm.controls.amtPassword.value.length).toBe(16)
  })

  it('should change the value of mebx password to a random strong password', () => {
    component.profileForm.controls.mebxPassword.setValue('1@qW')
    component.GenerateMEBXPassword()
    expect(component.profileForm.controls.mebxPassword.value.length).toBe(16)
  })

  it('should set the ciraCofigName property to null when TLS Selected', () => {
    component.connectionModeChange(ConnectionModes.TLS.value)
    expect(component.profileForm.controls.ciraConfigName.value).toEqual(null)
    expect(component.profileForm.controls.ciraConfigName.valid).toBeTrue()
    expect(component.profileForm.controls.tlsMode.valid).toBeFalse()
    expect(component.profileForm.controls.tlsSigningAuthority.value).toEqual(TlsSigningAuthorities.SELF_SIGNED.value)
    expect(component.profileForm.controls.tlsSigningAuthority.valid).toBeTrue()
  })
  it('should set the tlsMode property to null when CIRA Selected', () => {
    component.connectionModeChange(ConnectionModes.CIRA.value)
    expect(component.profileForm.controls.tlsMode.value).toEqual(null)
    expect(component.profileForm.controls.tlsMode.valid).toBeTrue()
  })
  it('should support ieee8021x visibility', () => {
    expect(component.showIEEE8021xConfigurations).toBeTrue()
    const keeper = [...ieee8021xAvailableConfigs]
    ieee8021xAvailableConfigs.splice(0)
    component.getIEEE8021xConfigs()
    expect(component.showIEEE8021xConfigurations).toBeFalse()
    ieee8021xAvailableConfigs.splice(0, 0, ...keeper)
    component.getIEEE8021xConfigs()
    expect(component.showIEEE8021xConfigurations).toBeTrue()
  })
  it('should support wireless visibility', () => {
    expect(component.showWirelessConfigurations).toBeTrue()
    const keeper = [...wirelessAvailableConfigs]
    wirelessAvailableConfigs.splice(0)
    component.getWirelessConfigs()
    expect(component.showWirelessConfigurations).toBeFalse()
    wirelessAvailableConfigs.splice(0, 0, ...keeper)
    component.getWirelessConfigs()
    expect(component.showWirelessConfigurations).toBeTrue()
  })
})
