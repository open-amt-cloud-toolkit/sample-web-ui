/*********************************************************************
* Copyright (c) Intel Corporation 2022
* SPDX-License-Identifier: Apache-2.0
**********************************************************************/

import { FormOption } from '../../models/models'

// https://software.intel.com/sites/manageability/AMT_Implementation_and_Reference_Guide/HTMLDocuments/WS-Management_Class_Reference/CIM_WiFiEndpointSettings.htm

export const AuthenticationMethodHelpers = {
  allExceptIEEE8021X (): Array<FormOption<number>> {
    // for now, these are same as ...
    return AuthenticationMethods.filter(m => m.value !== 5 && m.value !== 7) // exclude 'WPA IEEE 802.1x' and 'WPA2 IEEE 802.1x'
  },
  isIEEE8021X (value: number): boolean {
    return value === 5 || value === 7 // maps to 'WPA IEEE 802.1x' and 'WPA2 IEEE 802.1x'
  },
  isPSK (value: number): boolean {
    return value === 4 || value === 6 // maps to  'WPA PSK' and 'WPA2 PSK'
  }
}
export const AuthenticationMethods: Array<FormOption<number>> = [
  { value: 4, label: 'WPA PSK' },
  { value: 5, label: 'WPA IEEE 802.1x' },
  { value: 6, label: 'WPA2 PSK' },
  { value: 7, label: 'WPA2 IEEE 802.1x' }
]

export const EncryptionMethods: Array<FormOption<number>> = [
  { value: 3, label: 'TKIP' },
  { value: 4, label: 'CCMP' }
]

export interface Config {
  profileName: string
  authenticationMethod: number
  encryptionMethod: number
  ssid: string
  pskPassphrase?: string
  ieee8021xProfileName?: string
  version?: string
}
