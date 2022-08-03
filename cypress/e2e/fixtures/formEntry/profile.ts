/*********************************************************************
* Copyright (c) Intel Corporation 2022
* SPDX-License-Identifier: Apache-2.0
**********************************************************************/

import Constants from '../../../../src/app/shared/config/Constants'
const allConnections = [
  { mode: Constants.ConnectionModes.CIRA.display, selection: 'happyPath' },
  { mode: Constants.ConnectionModes.TLS.display, selection: Constants.TlsModes.SERVER.display },
  { mode: Constants.ConnectionModes.TLS.display, selection: Constants.TlsModes.SERVER_NON_TLS.display },
  { mode: Constants.ConnectionModes.TLS.display, selection: Constants.TlsModes.MUTUAL.display },
  { mode: Constants.ConnectionModes.TLS.display, selection: Constants.TlsModes.MUTUAL_NON_TLS.display }
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
        let profileName = `${activationMode.value}-${dhcpMode.display}`
        const profile: any = {
          // profileName: `${amtMode.value}-${dhcpS}-${tlsModes[conMode.value].profileValue as string}`,
          activationMode: activationMode.value,
          connectionMode: cnx.mode,
          connectionSelection: cnx.selection,
          // TODO: if we always use the env for this testing, why bother having it set in test profile?
          amtPassword: '', // Cypress.env('AMT_PASSWORD'),
          mebxPassword: '', // Cypress.env('MEBX_PASSWORD'),
          dhcpEnabled: dhcpMode.value,
          //   userConsent: Constants.UserConsent_All,
          iderEnabled: true,
          kvmEnabled: true,
          solEnabled: true
        }
        if ((wifi[0] as any).profileName) {
          if (!dhcpMode.value) { return }
          profileName += '-WiFi'
          profile.wifiConfigs = wifi
        }
        profile.profileName = profileName
        testProfiles.push(profile)
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
