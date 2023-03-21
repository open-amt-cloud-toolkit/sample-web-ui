/*********************************************************************
* Copyright (c) Intel Corporation 2022
* SPDX-License-Identifier: Apache-2.0
**********************************************************************/

import { AuthMethods, Config, ServerAddressFormats } from 'src/app/configs/configs.constants'

export const configs: Config[] = []

ServerAddressFormats.all().forEach(format => {
  let mpsServerAddress = '192.168.10.10'
  let commonName = mpsServerAddress
  if (format === ServerAddressFormats.FQDN) {
    mpsServerAddress = Cypress.env('FQDN')
    commonName = ''
  }

  const config: Config = {
    configName: `ciraCfg${format.label}`,
    mpsServerAddress,
    mpsPort: 4433,
    username: Cypress.env('MPS_USERNAME'),
    commonName,
    serverAddressFormat: format.value,
    authMethod: AuthMethods.USERNAME_PASSWORD.value,
    mpsRootCertificate: ''
  }
  configs.push(config)
})

export const MpsCertificate = '-----BEGIN CERTIFICATE-----\n' +
  'MIIEOzCCAqOgAwIBAgIDA5h4MA0GCSqGSIb3DQEBDAUAMD0xFzAVBgNVBAMTDk1Q\n' +
  'U1Jvb3QtN2ZjN2NhMRAwDgYDVQQKEwd1bmtub3duMRAwDgYDVQQGEwd1bmtub3du\n' +
  'MCAXDTIwMDExODAxNDAxMloYDzIwNTEwMTE4MDE0MDEyWjA9MRcwFQYDVQQDEw5N\n' +
  'UFNSb290LTdmYzdjYTEQMA4GA1UEChMHdW5rbm93bjEQMA4GA1UEBhMHdW5rbm93\n' +
  'bjCCAaIwDQYJKoZIhvcNAQEBBQADggGPADCCAYoCggGBAMEOeTOVcOY3bnJ6wLK+\n' +
  'gc5U/to401ggiWugdqo4y5lfT0zLkM2VGjd2974Pm98OsKZj3cGp7E7t4gjmS5wo\n' +
  'JzaxJ9HZmsy5radbSW1NYMwCMettnvtknt95uQUxdfO8hi0u2/fgA/CttQYI+87y\n' +
  'AlQTkNRfkGrD5rCCL0jTpOFiOiM3yM0dLXPmIJs6t84Lyu0mWlLoITdBPBYVFkN6\n' +
  'mshoK1zXEzkhlT9PiOKkLKeQJfLq8VVv+olv41TfTijyY3HV/Pk+Tn2IXpuC1EdC\n' +
  'wuuWW1CKmYnM+BmY5h/PwoSMQzGzrjoAL+TDi1RNNIkr6oae95MNo5IMrG/VnFrx\n' +
  'fKpELGjWr0Y3E2ETiwjt8Ztz2kAflg4OLZ692Kmc6JkP7PZFM2KmxPcHUXE/FmZp\n' +
  'MPRNKUzc5HBkQD64p3Q1j+RAntqwtz5WzL93K8GEjzdDi2uthP5P+s1WvJnGxEb0\n' +
  'dRFGyS31eTugIfdGr2zPtMydkYCAGYOyHX3kwMc5tyE6rwIDAQABo0IwQDAMBgNV\n' +
  'HRMEBTADAQH/MBEGCWCGSAGG+EIBAQQEAwIABzAdBgNVHQ4EFgQUf8fK7M9m+9EH\n' +
  'Fm1yvoOWau391WEwDQYJKoZIhvcNAQEMBQADggGBAE/+K9xaf5Ib+OGGhvyU4NxM\n' +
  'kQeNsB/7BxEARG8jJ3a1Wr0L0xaABI/7TQzxk+FEwCstm/Z8Qos8GrXtLrEcZONR\n' +
  'ZWLNdTH2itX9eYvx8uPLGP89ILnavivlbQ8DvFnV8EXXOaqz3zzIDzp+HxVumXSG\n' +
  '/YZWbQjyDCzthD/zuhlvXJca9/pZtqxLkBfT0ZBAGxzpBl82KytF/+LRw/wGBiI2\n' +
  'qNiHIp2nZUfvpYkBWtRzlVrvLzwlOGpdptkGgrmvjyJ25lllfDOOrizZpIsYVlgQ\n' +
  'Qtulx4EAn1ZuC0jPBxBrYqdkapFdNMY8LC1MMcnX75pfaRaus45WN/ds4JHOfw56\n' +
  'dkJZs9gmpWSocTeWHL85d1vLVruviQU5pJHUw8QyvLuXRxZef9+8reyoGBnmEVqk\n' +
  'oDOUjCYq53fLPH4czcMsZfh0lWuZc8oSg+rLEfozbSvxBNn2zn7cnFiRWrbFz6hE\n' +
  'i0IG+SRRxPly82In20v8J4mF1WntTZTYHyuRb/NO7Q==\n' +
  '-----END CERTIFICATE-----'
