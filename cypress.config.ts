/*********************************************************************
* Copyright (c) Intel Corporation 2022
* SPDX-License-Identifier: Apache-2.0
**********************************************************************/

import { defineConfig } from 'cypress'

export default defineConfig({
  reporter: 'junit',
  reporterOptions: {
    mochaFile: 'cypress-ui-test-output-[hash].xml'
  },
  projectId: 'mxeztq',
  env: {
    BASEURL: 'http://localhost:4200/',
    ISOLATE: 'Y',
    FQDN: '192.168.8.50',
    MPS_USERNAME: 'standalone',
    MPS_PASSWORD: 'G@ppm0ym',
    AMT_PASSWORD: 'P@ssw0rd',
    MEBX_PASSWORD: 'P@ssw0rd',
    WIFI_SSID: 'test',
    WIFI_PSK_PASSPHRASE: 'P@ssw0rd',
    VAULT_ADDRESS: 'http://localhost:8200',
    VAULT_TOKEN: 'myroot',
    PROVISIONING_CERT: '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',
    PROVISIONING_CERT_PASSWORD: 'Intel123!',
    DOMAIN_SUFFIX: 'mlopshub.com',
    RPC_DOCKER_IMAGE: 'vprodemo.azurecr.io/rpc-go:latest'
  },
  chromeWebSecurity: false,
  e2e: {
    screenshotOnRunFailure: false,
    specPattern: 'cypress/e2e/integration/**/*.ts'
  }
})
