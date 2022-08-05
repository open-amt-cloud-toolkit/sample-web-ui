/*********************************************************************
* Copyright (c) Intel Corporation 2022
* SPDX-License-Identifier: Apache-2.0
**********************************************************************/

type EventTypeMap = Record<number, string>
const EVENTTYPEMAP: EventTypeMap = {
  1: 'Threshold based event',
  7: 'Generic severity event',
  10: 'Linkup Event',
  111: 'Sensor specific event'
}
const ActivationModes = {
  ADMIN: {
    value: 'acmactivate',
    display: 'Admin Control Mode'
  },
  CLIENT: {
    value: 'ccmactivate',
    display: 'Client Control Mode'
  }
}
function parseActivationMode (value: string): string {
  for (const mode of Object.values(ActivationModes)) {
    if (value === mode.value) {
      return mode.display
    }
  }
  return ''
}
const ConnectionModes = {
  CIRA: {
    value: 'CIRA',
    display: 'CIRA (Cloud)'
  },
  TLS: {
    value: 'TLS',
    display: 'TLS (Enterprise)'
  }
}
function parseConnectionMode (value: string): string {
  for (const mode of Object.values(ConnectionModes)) {
    if (value === mode.value) {
      return mode.display
    }
  }
  return ''
}
const DhcpModes = {
  DHCP: {
    value: true,
    display: 'DHCP'
  },
  STATIC: {
    value: false,
    display: 'STATIC'
  }
}
function parseDhcpMode (value: boolean): string {
  for (const mode of Object.values(DhcpModes)) {
    if (value === mode.value) {
      return mode.display
    }
  }
  return ''
}
const TlsModes = {
  SERVER: {
    value: 1,
    display: 'Server Authentication Only'
  },
  SERVER_NON_TLS: {
    value: 2,
    display: 'Server & Non-TLS Authentication'
  },
  MUTUAL: {
    value: 3,
    display: 'Mutual TLS Authentication Only'
  },
  MUTUAL_NON_TLS: {
    value: 4,
    display: 'Mutual and Non-TLS Authentication'
  }
}
function parseTlsMode (value: number): string {
  for (const mode of Object.values(TlsModes)) {
    if (value === mode.value) {
      return mode.display
    }
  }
  return ''
}
const UserConsentModes = {
  ALL: {
    value: 'All',
    display: 'All'
  },
  KVM: {
    value: 'KVM',
    display: 'KVM Only'
  },
  NONE: {
    value: 'None',
    display: 'None'
  }
}
function parseUserConsentMode (value: string): string {
  for (const mode of Object.values(UserConsentModes)) {
    if (value === mode.value) {
      return mode.display
    }
  }
  return ''
}

export default {
  ActivationModes,
  parseActivationMode,
  ConnectionModes,
  parseConnectionMode,
  DhcpModes,
  parseDhcpMode,
  TlsModes,
  parseTlsMode,
  UserConsentModes,
  parseUserConsentMode,
  WPAPSK: 4,
  WPA2PSK: 6,
  TKIP: 3,
  CCMP: 4,
  // TODO: as a general constant this name is lame
  NORESULTS: 'No Wifi Configs Found',
  EVENTTYPEMAP: EVENTTYPEMAP
}
