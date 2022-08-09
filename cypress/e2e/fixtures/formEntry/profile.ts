/*********************************************************************
* Copyright (c) Intel Corporation 2022
* SPDX-License-Identifier: Apache-2.0
**********************************************************************/

import Constants from '../../../../src/app/shared/config/Constants'
const allConnections = [
  { id: 'CIRA-happyPath', mode: Constants.ConnectionModes.CIRA, tlsMode: null, ciraConfigName: 'happyPath' },
  { id: 'TLS-server', mode: Constants.ConnectionModes.TLS, tlsMode: Constants.TlsModes.SERVER, ciraConfigName: null },
  { id: 'TLS-servernontls', mode: Constants.ConnectionModes.TLS, tlsMode: Constants.TlsModes.SERVER_NON_TLS, ciraConfigName: null },
  { id: 'TLS-mutual', mode: Constants.ConnectionModes.TLS, tlsMode: Constants.TlsModes.MUTUAL, ciraConfigName: null },
  { id: 'TLS-mutualnontls', mode: Constants.ConnectionModes.TLS, tlsMode: Constants.TlsModes.MUTUAL_NON_TLS, ciraConfigName: null }
]
const wifiConfigs = [
  [{}], // support non wifi config
  [{
    priority: 1,
    profileName: 'happyPath'
  }]
]

const testProfiles: any[] = []
// build an array of profiles to be tested based on configuration permutations
for (const [, activationMode] of Object.entries(Constants.ActivationModes)) {
  for (const [,dhcpMode] of Object.entries(Constants.DhcpModes)) {
    allConnections.forEach((cnx) => {
      wifiConfigs.forEach((wifi) => {
        // generate a distincitive name of the general format
        // {activation}-{dhcp}-{connection}-{connectionselection}-{wifi}
        let name = `${activationMode.value}-${dhcpMode.display}-${cnx.id}`
        let curWifiCfgs = null
        if ((wifi[0] as any).profileName) {
          // Wi-Fi will not work over static Network
          if (!dhcpMode.value) { return }
          name += '-WiFi'
          curWifiCfgs = wifi
        }
        // creat a 'pure' profile with only the values that are valid for req/rsp
        // any usage of display strings should be looked up based on value
        const testProfile: any = {
          profileName: name,
          activation: activationMode.value,
          userConsent: Constants.UserConsentModes.ALL.value,
          iderEnabled: true,
          kvmEnabled: true,
          solEnabled: true,
          dhcpEnabled: dhcpMode.value,
          ciraConfigName: cnx.ciraConfigName,
          tlsMode: cnx.tlsMode?.value,
          wifiConfigs: curWifiCfgs
        }
        testProfiles.push(testProfile)
      })
    })
  }
}

const profileFixtures = {
  wrong: {
    name: 'bad name !',
    amtPassword: 'password',
    mebxPassword: '12345678'
  },
  totalCount: 100,
  happyPath: {
    profileName: 'happyPath',
    activation: Constants.ActivationModes.CLIENT.value,
    userConsent: Constants.UserConsentModes.ALL.value,
    iderEnabled: true,
    kvmEnabled: true,
    solEnabled: true,
    mebxPassword: 'P@ssw0rd',
    dhcpEnabled: Constants.DhcpModes.DHCP.value,
    ciraConfig: 'happyPath',
    tlsMode: null,
    wifiConfigs: [
      {
        priority: 1,
        profileName: 'happyPath'
      }
    ]
  },
  happyPathTls: {
    profileName: 'happyTlspath',
    activation: Constants.ActivationModes.CLIENT.value,
    userConsent: Constants.UserConsentModes.ALL.value,
    iderEnabled: true,
    kvmEnabled: true,
    solEnabled: true,
    amtPassword: 'P@ssw0rd',
    mebxPassword: 'P@ssw0rd',
    dhcpEnabled: Constants.DhcpModes.DHCP.value,
    ciraConfig: null,
    tlsMode: Constants.TlsModes.SERVER.value,
    generateRandomPassword: false,
    wifiConfigs: [
      {
        profileName: 'happyPath',
        priority: 1
      }
    ]
  },

  happyPathStaticCIRA: {
    profileName: 'happyPathStaticCIRA',
    activation: Constants.ActivationModes.CLIENT.value,
    userConsent: Constants.UserConsentModes.ALL.value,
    iderEnabled: true,
    kvmEnabled: true,
    solEnabled: true,
    amtPassword: 'P@ssw0rd',
    mebxPassword: 'P@ssw0rd',
    dhcpEnabled: Constants.DhcpModes.STATIC.value,
    ciraConfig: 'happyPath',
    tlsMode: null,
    wifiConfigs: [
      {
        profileName: 'happyPath',
        priority: 1
      }
    ]
  },

  happyPathStaticCIRARandomPassword: {
    profileName: 'happyPathStaticCIRARandomPassword',
    activation: Constants.ActivationModes.CLIENT.value,
    userConsent: Constants.UserConsentModes.ALL.value,
    iderEnabled: true,
    kvmEnabled: true,
    solEnabled: true,
    amtPassword: 'P@ssw0rd',
    mebxPassword: 'P@ssw0rd',
    dhcpEnabled: Constants.DhcpModes.STATIC.value,
    ciraConfig: 'happyPath',
    tlsMode: null
  },
  patchWirelessConfigHappyPath: {
    profileName: 'happyTlspath',
    activation: Constants.ActivationModes.ADMIN.value,
    userConsent: Constants.UserConsentModes.ALL.value,
    iderEnabled: true,
    kvmEnabled: true,
    solEnabled: true,
    generateRandomPassword: false,
    generateRandomMEBxPassword: false,
    tags: [],
    dhcpEnabled: Constants.DhcpModes.DHCP.value,
    ciraConfigName: null,
    tlsMode: Constants.TlsModes.SERVER.value,
    tenantId: '',
    wifiConfigs: [
      {
        profileName: 'happyPath',
        priority: 1
      }
    ]
  },
  patchServerAuthentication: {
    profileName: 'happyTlspath',
    activation: Constants.ActivationModes.ADMIN.value,
    userConsent: Constants.UserConsentModes.ALL.value,
    iderEnabled: true,
    kvmEnabled: true,
    solEnabled: true,
    generateRandomPassword: false,
    generateRandomMEBxPassword: false,
    tags: [],
    dhcpEnabled: Constants.DhcpModes.DHCP.value,
    ciraConfigName: null,
    tlsMode: Constants.TlsModes.SERVER.value,
    tenantId: '',
    wifiConfigs: []
  },
  patchServerNonTLS: {
    profileName: 'happyTlspath',
    activation: Constants.ActivationModes.ADMIN.value,
    userConsent: Constants.UserConsentModes.ALL.value,
    iderEnabled: true,
    kvmEnabled: true,
    solEnabled: true,
    generateRandomPassword: false,
    generateRandomMEBxPassword: false,
    tags: [],
    dhcpEnabled: Constants.DhcpModes.DHCP.value,
    ciraConfigName: null,
    tlsMode: Constants.TlsModes.SERVER_NON_TLS.value,
    tenantId: '',
    wifiConfigs: []
  },
  patchMutualTLS: {
    profileName: 'happyTlspath',
    activation: Constants.ActivationModes.ADMIN.value,
    userConsent: Constants.UserConsentModes.ALL.value,
    iderEnabled: true,
    kvmEnabled: true,
    solEnabled: true,
    generateRandomPassword: false,
    generateRandomMEBxPassword: false,
    tags: [],
    dhcpEnabled: Constants.DhcpModes.DHCP.value,
    ciraConfigName: null,
    tlsMode: Constants.TlsModes.MUTUAL.value,
    tenantId: '',
    wifiConfigs: []
  },
  patchMutualNonTLS: {
    profileName: 'happyTlspath',
    activation: Constants.ActivationModes.ADMIN.value,
    userConsent: Constants.UserConsentModes.ALL.value,
    iderEnabled: true,
    kvmEnabled: true,
    solEnabled: true,
    generateRandomPassword: false,
    generateRandomMEBxPassword: false,
    tags: [],
    dhcpEnabled: Constants.DhcpModes.DHCP.value,
    ciraConfigName: null,
    tlsMode: Constants.TlsModes.MUTUAL_NON_TLS.value,
    tenantId: '',
    wifiConfigs: []
  },
  patchSTATIC: {
    profileName: 'happyTlspath',
    activation: Constants.ActivationModes.CLIENT.value,
    userConsent: Constants.UserConsentModes.ALL.value,
    iderEnabled: true,
    kvmEnabled: true,
    solEnabled: true,
    generateRandomPassword: false,
    generateRandomMEBxPassword: false,
    tags: [],
    dhcpEnabled: Constants.DhcpModes.STATIC.value,
    ciraConfigName: null,
    tlsMode: Constants.TlsModes.SERVER.value,
    tenantId: '',
    wifiConfigs: []
  }
}
export { profileFixtures, testProfiles }
