/*********************************************************************
* Copyright (c) Intel Corporation 2022
* SPDX-License-Identifier: Apache-2.0
**********************************************************************/

// eslint-disable-next-line @typescript-eslint/triple-slash-reference
/// <reference types="cypress" />

import { httpCodes } from '../e2e/fixtures/api/httpCodes'
import Constants from '../../src/app/shared/config/Constants'

declare global {
  namespace Cypress {
    interface Chainable {
      chooseMaterialSelect: (formControlName: string, value: string) => Chainable<Element>
      setMaterialCheckbox: (formControlName: string, checked: boolean) => Chainable<Element>
      typeMaterialTextInput: (formControlName: string, value: string) => Chainable<Element>
      setup: () => Chainable<Element>
      login: (user: string, password: string) => Chainable<Element>
      myIntercept: (method: string, url: string | RegExp, body: any) => Chainable<Element>
      goToPage: (pageName: string) => Chainable<Element>
      enterCiraInfo: (name: string, format: string, addr: string, user: string) => Chainable<Element>
      enterDomainInfo: (name: string, domain: string, file: Cypress.FileReference, pass: string) => Chainable<Element>
      enterWirelessInfo: (name: string, ssid: string, password: string, authenticationMethod: string, encryptionMethod: string) => Chainable<Element>
      enterProfileInfo: (name: string, activation: string, randAmt: boolean, randMebx: boolean, network: boolean, connection: string, connectionConfig: string, userConsent: string, iderEnabled: boolean, kvmEnabled: boolean, solEnabled: boolean, wifiConfigs?: Array<{ profileName: string, priority: number }>) => Chainable<Element>
      setAMTMEBXPasswords: (mode: string, amtPassword: string, mebxPassword: string) => Chainable<Element>
      setProfileActivationMode: (activationMode: string) => Chainable<Element>
      setProfileDhcp: (dhcpEnabled: boolean) => Chainable<Element>
      setProfileRedirectionFeatures: (userConsent: string, iderEnabled: boolean, kvmEnabled: boolean, solEnabled: boolean) => Chainable<Element>
      assertProfileRedirectionFeatures: (userConsent: string, iderEnabled: boolean, kvmEnabled: boolean, solEnabled: boolean) => Chainable<Element>
      setProfilePasswordAMT: (generate: boolean) => Chainable<Element>
      setMEBXPassword: (generate: boolean) => Chainable<Element>
    }
  }
}

Cypress.Commands.add('setMaterialCheckbox', (formControlName: string, checked: boolean) => {
  // check that the form element is enabled
  cy.get(`mat-checkbox[formcontrolname=${formControlName}]`).find('[type="checkbox"]').invoke('is', ':disabled').then(isDisabled => {
    if (!isDisabled) {
      // material checkbox input elements are hidden/covered so not 'checkable' without forcing
      if (checked) {
        cy.get(`mat-checkbox[formcontrolname=${formControlName}]`).find('[type="checkbox"]').check({ force: true })
      } else {
        cy.get(`mat-checkbox[formcontrolname=${formControlName}]`).find('[type="checkbox"]').uncheck({ force: true })
      }
    }
  })
})

Cypress.Commands.add('typeMaterialTextInput', (formControlName: string, value: string) => {
  // check that the form element is enabled
  cy.get(`[formcontrolname=${formControlName}]`).as('input').invoke('is', ':disabled').then(isDisabled => {
    if (!isDisabled) {
      cy.get('@input').type(value)
    }
  })
})

Cypress.Commands.add('chooseMaterialSelect', (formControlName: string, value: string) => {
  // check that the form element is enabled
  cy.get(`[formcontrolname=${formControlName}]`).as('input').invoke('is', ':disabled').then(isDisabled => {
    if (!isDisabled) {
      cy.get('@input').click().get('mat-option').contains(value).click()
    }
  })
})
// -------------------- before / beforeEach ---------------------------

Cypress.Commands.add('setup', () => {
  cy.window().then((win) => {
    win.sessionStorage.clear()
  })

  cy.myIntercept('POST', 'authorize', {
    statusCode: httpCodes.SUCCESS,
    body: { token: '' }
  }).as('login-request')

  cy.myIntercept('GET', 'api/v1/devices/stats', {
    statusCode: 200,
    body: {}
  }).as('stats-request')

  // Login
  cy.visit(Cypress.env('BASEURL'))
  const mpsUsername = Cypress.env('MPS_USERNAME')
  const mpsPassword = Cypress.env('MPS_PASSWORD')
  cy.login(mpsUsername, mpsPassword)
  cy.wait('@login-request')
    .its('response.statusCode')
    .should('eq', httpCodes.SUCCESS)
})

// ------------------- Enter info into a form -------------------------

Cypress.Commands.add('login', (user, pass) => {
  if (user !== 'EMPTY') {
    cy.get('[name=userId]').type(user)
  }
  if (pass !== 'EMPTY') {
    cy.get('[name=Password]').type(pass)
  }
  cy.get('[id=btnLogin]').get('[type=submit]').click()
})

Cypress.Commands.add('enterCiraInfo', (name, format, addr, user) => {
  cy.get('input').get('[name=configName]').type(name)
  if (format === 'FQDN') {
    cy.contains('FQDN').click()
  }
  cy.get('input').get('[name=mpsServerAddress]').type(addr)
  cy.get('input').get('[name=username]').clear().type(user)
})

Cypress.Commands.add(
  'enterProfileInfo',
  (
    name, activationMode,
    randAmtPassword, randomMebxPassword,
    dhcpEnabled,
    connectionMode, connectionSelection,
    userConsent, iderEnabled, kvmEnabled, solEnabled,
    wifiConfigs
  ) => {
    cy.typeMaterialTextInput('profileName', name)
    // cy.get('[name=profileName]').then((x) => {
    //   if (!x.is(':disabled')) {
    //     cy.get('[name=profileName]').type(name)
    //   }
    // })
    cy.chooseMaterialSelect('activation', activationMode)

    cy.setMaterialCheckbox('generateRandomPassword', randAmtPassword)
    if (!randAmtPassword) {
      cy.typeMaterialTextInput('amtPassword', Cypress.env('AMT_PASSWORD'))
    }
    cy.setMaterialCheckbox('generateRandomMEBxPassword', randomMebxPassword)
    if (!randomMebxPassword) {
      cy.typeMaterialTextInput('mebxPassword', Cypress.env('MEBX_PASSWORD'))
    }
    cy.contains(Constants.parseDhcpMode(dhcpEnabled)).click()

    cy.contains(connectionMode).click()
    if (connectionMode === Constants.ConnectionModes.CIRA.display) {
      cy.chooseMaterialSelect('ciraConfigName', connectionSelection)
    } else if (connectionMode === Constants.ConnectionModes.TLS.display) {
      cy.chooseMaterialSelect('tlsMode', connectionSelection)
    }

    if (wifiConfigs != null && wifiConfigs.length > 0) {
      wifiConfigs.forEach(wifiProfile => {
        cy.get('input[data-cy=wifiAutocomplete]').type(wifiProfile.profileName)
        cy.get('mat-option').contains(wifiProfile.profileName).click()
      })
    }
    cy.get('mat-select[formControlName=userConsent] option:checked').should('have.value', userConsent)
    cy.setMaterialCheckbox('iderEnabled', iderEnabled)
    cy.setMaterialCheckbox('kvmEnabled', kvmEnabled)
    cy.setMaterialCheckbox('solEnabled', solEnabled)
  })

Cypress.Commands.add('enterDomainInfo', (name, domain, file, pass) => {
  cy.get('input[name="name"]').type(name)
  cy.get('input[name="domainName"]').type(domain)
  cy.get('input[type="file"]').selectFile(file, { force: true }) // force true because the file selector is always hidden
  cy.get('input[name="provisioningCertPassword"]').type(pass)
})

Cypress.Commands.add('enterWirelessInfo', (name, ssid, password, authMethod, encryptionMethod) => {
  cy.get('input[name="profileName"]').type(name)
  cy.get('input[name="ssid"]').type(ssid)
  cy.get('input[name="pskPassphrase"]').type(password)
  cy.get('mat-select[formControlName=authenticationMethod]').click().get('mat-option').contains(authMethod).click()
  cy.get('mat-select[formControlName=encryptionMethod]').click().get('mat-option').contains(encryptionMethod).click()
})

Cypress.Commands.add('assertProfileRedirectionFeatures', (userConsent: string, iderEnabled: boolean, kvmEnabled: boolean, solEnabled: boolean) => {
  cy.get('mat-select[formControlName=userConsent] option:checked').should('have.value', userConsent)
  cy.setMaterialCheckbox('iderEnabled', iderEnabled)
  cy.setMaterialCheckbox('kvmEnabled', kvmEnabled)
  cy.setMaterialCheckbox('solEnabled', solEnabled)
})

// ------------------------- Common Navigation --------------------------

Cypress.Commands.add('goToPage', (pageName) => {
  cy.get('.mat-list-item').contains(pageName).click()
})

// ------------------------------- Other --------------------------------

Cypress.Commands.add('myIntercept', (method, url, body) => {
  if (Cypress.env('ISOLATE').charAt(0).toLowerCase() !== 'n') {
    cy.intercept({
      method,
      url
    }, body)
  } else {
    cy.intercept({ method, url })
  }
})
