/*********************************************************************
 * Copyright (c) Intel Corporation 2021
 * SPDX-License-Identifier: Apache-2.0
 **********************************************************************/
const profileFixtures = {
  happyPath: {
    profileName: 'happyPath',
    activation: 'ccmactivate',
    amtPassword: 'P@ssw0rd',
    mebxPassword: 'P@ssw0rd',
    connectionMode: 'CIRA (Cloud)',
    dhcpEnabled: true,
    ciraConfig: 'happyPath'
  },

  wrong: {
    name: 'bad name !',
    amtPassword: 'password',
    mebxPassword: '12345678'
  },

  check: {
    network: {
      dhcp: true,
      static: false
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
    tlsConfig: 'Server Authentication Only'
  },
  happyPathTlsRandomMebxPwd: {
    profileName: 'happyTlsRandomMebxPwdpath',
    activation: 'ccmactivate',
    amtPassword: 'P@ssw0rd',
    mebxPassword: 'P@ssw0rd',
    dhcpEnabled: true,
    connectionMode: 'TLS (Enterprise)',
    tlsConfig: 'Server Authentication Only'
  },
  happyPathTlsRandomPwd: {
    profileName: 'happyTlsRandomPwdpath',
    activation: 'ccmactivate',
    amtPassword: 'P@ssw0rd',
    mebxPassword: 'P@ssw0rd',
    dhcpEnabled: true,
    connectionMode: 'TLS (Enterprise)',
    tlsConfig: 'Server Authentication Only'
  },
  happyPathStaticNetwork: {
    profileName: 'happyStaticPath',
    activation: 'ccmactivate',
    dhcpEnabled: false,
    connectionMode: 'TLS (Enterprise)',
    tlsConfig: 'Server Authentication Only'
  },
  happyPathStaticNetworkPwd: {
    profileName: 'happyStaticPathPwd',
    activation: 'ccmactivate',
    dhcpEnabled: false,
    connectionMode: 'TLS (Enterprise)',
    tlsConfig: 'Server Authentication Only'
  },
  happyPathTlsAdmin: {
    profileName: 'happyTlspathAdmin',
    activation: 'acmactivate',
    amtPassword: 'P@ssw0rd',
    mebxPassword: 'P@ssw0rd',
    dhcpEnabled: true,
    connectionMode: 'TLS (Enterprise)',
    tlsConfig: 'Server Authentication Only'
  },
  happyPathAdmin: {
    profileName: 'happyPathAdmin',
    activation: 'acmactivate',
    amtPassword: 'P@ssw0rd',
    mebxPassword: 'P@ssw0rd',
    connectionMode: 'CIRA (Cloud)',
    dhcpEnabled: true,
    ciraConfig: 'happyPath'
  },
  happyPathRandomPwd: {
    profileName: 'happyPathRandomPwd',
    activation: 'ccmactivate',
    amtPassword: 'P@ssw0rd',
    mebxPassword: 'P@ssw0rd',
    connectionMode: 'CIRA (Cloud)',
    dhcpEnabled: true,
    ciraConfig: 'happyPath'
  }
}
export { profileFixtures }
