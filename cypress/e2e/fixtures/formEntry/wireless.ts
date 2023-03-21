/*********************************************************************
* Copyright (c) Intel Corporation 2022
* SPDX-License-Identifier: Apache-2.0
**********************************************************************/

import * as formEntryIEEE8021x from './ieee8021x'
import { AuthenticationMethods, Config, EncryptionMethods } from 'src/app/wireless/wireless.constants'

export const configs: Config[] = []
AuthenticationMethods.all().forEach(authenticationMethod => {
  EncryptionMethods.all().forEach(encryptionMethod => {
    const config: Config = {
      profileName: `wireless${encryptionMethod.label}${authenticationMethod.label.replace(/[^0-9a-z]/gi, '')}`,
      authenticationMethod: authenticationMethod.value,
      encryptionMethod: encryptionMethod.value,
      ssid: `ssid${authenticationMethod.value}${encryptionMethod.value}`
    }
    if (AuthenticationMethods.isIEEE8021X(authenticationMethod.value)) {
      config.ieee8021xProfileName = formEntryIEEE8021x.wirelessConfigs[0].profileName
    } else if (AuthenticationMethods.isPSK(authenticationMethod.value)) {
      config.pskPassphrase = '0123456789ABCDEF'
    }
    configs.push(config)
  })
})
