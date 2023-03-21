/*********************************************************************
* Copyright (c) Intel Corporation 2022
* SPDX-License-Identifier: Apache-2.0
**********************************************************************/

import {
  ActivationModes,
  DhcpModes,
  Profile,
  TlsModes,
  TlsSigningAuthorities,
  UserConsentModes
} from 'src/app/profiles/profiles.constants'
import * as formEntryCIRA from 'cypress/e2e/fixtures/formEntry/cira'
import * as formEntryIEEE8021x from 'cypress/e2e/fixtures/formEntry/ieee8021x'
import * as formEntryWireless from 'cypress/e2e/fixtures/formEntry/wireless'

const profiles: Profile[] = []

const profile: Profile = {
  profileName: '',
  activation: '',
  iderEnabled: true,
  kvmEnabled: true,
  solEnabled: true,
  userConsent: '',
  generateRandomPassword: false,
  generateRandomMEBxPassword: false,
  dhcpEnabled: true,
  ieee8021xProfileName: formEntryIEEE8021x.wiredConfigs[0].profileName,
  tags: []
}

ActivationModes.all().forEach((activationMode) => {
  DhcpModes.all().forEach((dhcpMode) => {
    [true, false].forEach((addWirelessProfiles) => {
      let curProfileName = `${activationMode.value}-${dhcpMode.label}`
      profile.activation = activationMode.value
      profile.userConsent = UserConsentModes.ALL.value
      profile.dhcpEnabled = dhcpMode.value
      profile.wifiConfigs = []
      if (addWirelessProfiles) {
        // this combo does not work
        if (dhcpMode !== DhcpModes.DHCP) {
          return
        }
        curProfileName += '-WiFi'
        let priority = 1
        profile.wifiConfigs = formEntryWireless.configs
          .slice(0, 2)
          .map(cfg => ({
              profileName: cfg.profileName,
              priority: priority++
          }))
      }

      // add a couple of TLS modes/authorities
      delete profile.ciraConfigName
      const options = [
        { mode: TlsModes.MUTUAL, auth: TlsSigningAuthorities.SELF_SIGNED },
        { mode: TlsModes.SERVER_NON_TLS, auth: TlsSigningAuthorities.MICROSOFT_CA }
        ]
      options.forEach(o => {
        profile.profileName = `${curProfileName}-TLS${o.mode.value}-${o.auth.value}`
        profile.tlsMode = o.mode.value
        profile.tlsSigningAuthority = o.auth.value
        profiles.push({ ...profile })
      })

      // add a CIRA
      delete profile.tlsMode
      delete profile.tlsSigningAuthority
      profile.profileName = `${curProfileName}-CIRA`
      profile.ciraConfigName = formEntryCIRA.configs[0].configName
      profiles.push({ ...profile })
    })
  })
})

export { profiles }
