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
          ciraConfigName: cnx.ciraConfigName,
          tlsMode: cnx.tlsMode?.value,
          dhcpEnabled: dhcpMode.value,
          wifiConfigs: curWifiCfgs
        }
        testProfiles.push(testProfile)
      })
    })
  }
}

const profileFixtures = {
  happyPath: {
    profileName: 'happyPath',
    activation: 'ccmactivate',

    mebxPassword: 'P@ssw0rd',
    connectionMode: 'CIRA (Cloud)',
    dhcpEnabled: true,
    ciraConfig: 'happyPath',
    userConsent: Constants.UserConsentModes.ALL.value,
    iderEnabled: true,
    kvmEnabled: true,
    solEnabled: true,
    wifiConfigs: [
      {
        priority: 1,
        profileName: 'happyPath'
      }
    ]
  },

  wrong: {
    name: 'bad name !',
    amtPassword: 'password',
    mebxPassword: '12345678'
  },

  check: {
    network: {
      dhcp: 'DHCP',
      static: 'Static'
    },

    mode: {
      acm: 'acmactivate',
      ccm: 'ccmactivate'
    }
  },

  totalCount: 100,
  happyPathTls: {
    profileName: 'happyTlspath',
    activation: 'ccmactivate',
    amtPassword: 'P@ssw0rd',
    mebxPassword: 'P@ssw0rd',
    dhcpEnabled: true,
    connectionMode: 'TLS (Enterprise)',
    tlsConfig: 'Server Authentication Only',
    generateRandomPassword: false,
    userConsent: Constants.UserConsentModes.ALL.value,
    iderEnabled: true,
    kvmEnabled: true,
    solEnabled: true,
    wifiConfigs: [
      {
        profileName: 'happyPath',
        priority: 1
      }
    ]
  },

  happyPathStaticCIRA: {
    profileName: 'happyPathStaticCIRA',
    activation: 'ccmactivate',
    amtPassword: 'P@ssw0rd',
    mebxPassword: 'P@ssw0rd',
    connectionMode: 'CIRA (Cloud)',
    dhcpEnabled: false,
    ciraConfig: 'happyPath',
    userConsent: Constants.UserConsentModes.ALL.value,
    iderEnabled: true,
    kvmEnabled: true,
    solEnabled: true,
    wifiConfigs: [
      {
        profileName: 'happyPath',
        priority: 1
      }
    ]
  },

  happyPathStaticCIRARandomPassword: {
    profileName: 'happyPathStaticCIRARandomPassword',
    activation: 'ccmactivate',
    amtPassword: 'P@ssw0rd',
    mebxPassword: 'P@ssw0rd',
    connectionMode: 'CIRA (Cloud)',
    dhcpEnabled: false,
    ciraConfig: 'happyPath',
    userConsent: Constants.UserConsentModes.ALL.value,
    iderEnabled: true,
    kvmEnabled: true,
    solEnabled: true
  },
  patchWirelessConfigHappyPath: {
    profileName: 'happyTlspath',
    activation: 'acmactivate',
    ciraConfigName: null,
    generateRandomPassword: false,
    generateRandomMEBxPassword: false,
    tags: [],
    dhcpEnabled: true,
    tlsMode: 1,
    tenantId: '',
    wifiConfigs: [
      {
        profileName: 'happyPath',
        priority: 1
      }
    ],
    userConsent: Constants.UserConsentModes.ALL.value,
    iderEnabled: true,
    kvmEnabled: true,
    solEnabled: true
  },
  patchServerAuthentication: {
    profileName: 'happyTlspath',
    // todo: use constants
    activation: 'acmactivate',
    ciraConfigName: null,
    generateRandomPassword: false,
    generateRandomMEBxPassword: false,
    tags: [],
    dhcpEnabled: true,
    tlsMode: 1,
    tenantId: '',
    wifiConfigs: []
  },
  patchServerNonTLS: {
    profileName: 'happyTlspath',
    activation: 'acmactivate',
    ciraConfigName: null,
    generateRandomPassword: false,
    generateRandomMEBxPassword: false,
    tags: [],
    dhcpEnabled: true,
    tlsMode: 2,
    tenantId: '',
    wifiConfigs: []
  },
  patchMutualTLS: {
    profileName: 'happyTlspath',
    activation: 'acmactivate',
    ciraConfigName: null,
    generateRandomPassword: false,
    generateRandomMEBxPassword: false,
    tags: [],
    dhcpEnabled: true,
    tlsMode: 3,
    tenantId: '',
    wifiConfigs: []
  },
  patchMutualNonTLS: {
    profileName: 'happyTlspath',
    activation: 'acmactivate',
    ciraConfigName: null,
    generateRandomPassword: false,
    generateRandomMEBxPassword: false,
    tags: [],
    dhcpEnabled: true,
    tlsMode: 4,
    tenantId: '',
    wifiConfigs: []
  },
  patchSTATIC: {
    profileName: 'happyTlspath',
    activation: 'ccmactivate',
    ciraConfigName: null,
    generateRandomPassword: false,
    generateRandomMEBxPassword: false,
    tags: [],
    dhcpEnabled: false,
    tlsMode: 1,
    tenantId: '',
    wifiConfigs: []
  }
}
export { profileFixtures, testProfiles }
