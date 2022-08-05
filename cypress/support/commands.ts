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
      matCheckboxSet: (selector: string, checked: boolean) => Chainable<Element>
      matCheckboxAssert: (selector: string, checked: boolean) => Chainable<Element>
      matListAssert: (selector: string, value: string) => Chainable<Element>
      matRadioButtonChoose: (selector: string, value: string) => Chainable<Element>
      matRadioButtonAssert: (selector: string, value: string) => Chainable<Element>
      matSelectChoose: (selector: string, value: string) => Chainable<Element>
      matSelectAssert: (selector: string, value: string) => Chainable<Element>
      matTextlikeInputType: (selector: string, value: string) => Chainable<Element>
      matTextlikeInputAssert: (selector: string, value: string) => Chainable<Element>
      setup: () => Chainable<Element>
      login: (user: string, password: string) => Chainable<Element>
      myIntercept: (method: string, url: string | RegExp, body: any) => Chainable<Element>
      goToPage: (pageName: string) => Chainable<Element>
      enterCiraInfo: (name: string, format: string, addr: string, user: string) => Chainable<Element>
      enterDomainInfo: (name: string, domain: string, file: Cypress.FileReference, pass: string) => Chainable<Element>
      enterWirelessInfo: (name: string, ssid: string, password: string, authenticationMethod: string, encryptionMethod: string) => Chainable<Element>
      enterProfileInfo: (
        name: string, activation: string,
        userConsent: string, iderEnabled: boolean, kvmEnabled: boolean, solEnabled: boolean,
        randAmt: boolean, randMebx: boolean,
        dhcpEnabled: boolean,
        ciraConfigName: string, tlsMode: number,
        wifiConfigs?: Array<{ profileName: string, priority: number }>
      ) => Chainable<Element>
      assertProfileInfo: (
        name: string, activation: string,
        userConsent: string, iderEnabled: boolean, kvmEnabled: boolean, solEnabled: boolean,
        randAmt: boolean, randMebx: boolean,
        dhcpEnabled: boolean,
        ciraConfigName: string, tlsMode: number,
        wifiConfigs?: Array<{ profileName: string, priority: number }>
      ) => Chainable<Element>
      setAMTMEBXPasswords: (mode: string, amtPassword: string, mebxPassword: string) => Chainable<Element>
    }
  }
}

Cypress.Commands.add('matCheckboxSet', (selector: string, checked: boolean) => {
  const elementId = `mat-checkbox${selector}`
  cy.get(elementId).invoke('is', ':disabled').then(isDisabled => {
    if (!isDisabled) {
      // material checkbox input elements are hidden/covered so not 'checkable' without forcing
      if (checked) {
        cy.get(elementId).find('[type="checkbox"]').check({ force: true })
      } else {
        cy.get(elementId).find('[type="checkbox"]').uncheck({ force: true })
      }
    }
  })
})

Cypress.Commands.add('matCheckboxAssert', (selector: string, checked: boolean) => {
  cy.get(`mat-checkbox${selector}`).find('[type="checkbox"]').should(checked ? 'be.checked' : 'not.be.checked')
})

Cypress.Commands.add('matListAssert', (selector: string, value: string) => {
  cy.get(`mat-list${selector}`).contains('mat-list-item', value)
})

Cypress.Commands.add('matRadioButtonChoose', (selector: string, value: string) => {
  const elementId = `mat-radio-group${selector}`
  cy.get(elementId).invoke('is', ':disabled').then(isDisabled => {
    if (!isDisabled) {
      // these low level radio buttons are hidden so need to force
      cy.get(elementId).find(`[value="${value}"]`).click({ force: true })
    }
  })
})

Cypress.Commands.add('matRadioButtonAssert', (selector: string, value: string) => {
  // use 'include' rather than have as the styling
  // this does use a css class for the find, but not sure of a better way to find the radio button
  cy.get(`mat-radio-group${selector}`).find('.mat-radio-checked').find(':radio').should('have.attr', 'value', value)
})

Cypress.Commands.add('matSelectChoose', (selector: string, value: string) => {
  const elementId = `mat-select${selector}`
  cy.get(elementId).then((el) => {
    if (el.attr('aria-disabled') === 'false') {
      cy.get(elementId).click().get(`[ng-reflect-value="${value}"]`).click()
      // cy.get(elementId).click().get('mat-option').contains(value).click()
    }
  })
})

Cypress.Commands.add('matSelectAssert', (selector: string, text: string) => {
  const elementId = `mat-select${selector}`
  cy.get(elementId).should('include.text', text)
})

Cypress.Commands.add('matTextlikeInputType', (selector: string, value: string) => {
  cy.get(selector).invoke('is', ':disabled').then(isDisabled => {
    if (!isDisabled) {
      cy.get(selector).type(value)
    }
  })
})

Cypress.Commands.add('matTextlikeInputAssert', (selector: string, value: string) => {
  cy.get(selector).should('have.value', value)
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
    name, activation,
    userConsent, iderEnabled, kvmEnabled, solEnabled,
    randAmtPassword, randomMebxPassword,
    dhcpEnabled,
    ciraConfigName, tlsMode,
    wifiConfigs
  ) => {
    cy.matTextlikeInputType('[formControlName="profileName"]', name)
    cy.matSelectChoose('[formControlName="activation"]', activation)
    cy.matSelectChoose('[formControlName="userConsent"]', userConsent)
    cy.matCheckboxSet('[formControlName="iderEnabled"]', iderEnabled)
    cy.matCheckboxSet('[formControlName="kvmEnabled"]', kvmEnabled)
    cy.matCheckboxSet('[formControlName="solEnabled"]', solEnabled)
    cy.matCheckboxSet('[formControlName="generateRandomPassword"]', randAmtPassword)
    if (!randAmtPassword) {
      cy.matTextlikeInputType('[formControlName="amtPassword"]', Cypress.env('AMT_PASSWORD'))
    }
    cy.matCheckboxSet('[formControlName="generateRandomMEBxPassword"]', randomMebxPassword)
    if (!randomMebxPassword) {
      cy.matTextlikeInputType('[formControlName="mebxPassword"]', Cypress.env('MEBX_PASSWORD'))
    }
    // selectors need string values so convert booleans
    cy.matRadioButtonChoose('[formControlName="dhcpEnabled"]', dhcpEnabled ? 'true' : 'false')
    if (ciraConfigName) {
      cy.matRadioButtonChoose('[formControlName="connectionMode"]', Constants.ConnectionModes.CIRA.value)
      cy.matSelectChoose('[formControlName="ciraConfigName"]', ciraConfigName)
    } else if (tlsMode) {
      cy.matRadioButtonChoose('[formControlName="connectionMode"]', Constants.ConnectionModes.TLS.value)
      cy.matSelectChoose('[formControlName="tlsMode"]', tlsMode.toString())
    }
    if (wifiConfigs != null && wifiConfigs.length > 0) {
      wifiConfigs.forEach(wifiProfile => {
        cy.matTextlikeInputType('[data-cy=wifiAutocomplete]', wifiProfile.profileName)
        // cy.get('input[data-cy=wifiAutocomplete]').type(wifiProfile.profileName)
        cy.get('mat-option').contains(wifiProfile.profileName).click()
      })
    }
  })

Cypress.Commands.add(
  'assertProfileInfo',
  (
    name, activation,
    userConsent, iderEnabled, kvmEnabled, solEnabled,
    randAmtPassword, randomMebxPassword,
    dhcpEnabled,
    ciraConfigName, tlsMode,
    wifiConfigs
  ) => {
    cy.matTextlikeInputAssert('[formControlName="profileName"]', name)
    cy.matSelectAssert('[formControlName="activation"]', Constants.parseActivationMode(activation))
    cy.matSelectAssert('[formControlName="userConsent"]', Constants.parseUserConsentMode(userConsent))
    cy.matCheckboxAssert('[formControlName="iderEnabled"]', iderEnabled)
    cy.matCheckboxAssert('[formControlName="kvmEnabled"]', kvmEnabled)
    cy.matCheckboxAssert('[formControlName="solEnabled"]', solEnabled)
    cy.matRadioButtonAssert('[formControlName="dhcpEnabled"]', dhcpEnabled ? 'true' : 'false')
    if (ciraConfigName) {
      cy.matRadioButtonAssert('[formControlName="connectionMode"]', Constants.ConnectionModes.CIRA.value)
      cy.matSelectAssert('[formControlName="ciraConfigName"]', ciraConfigName)
    }
    if (tlsMode) {
      cy.matRadioButtonAssert('[formControlName="connectionMode"]', Constants.ConnectionModes.TLS.value)
      cy.matSelectAssert('[formControlName="tlsMode"]', Constants.parseTlsMode(tlsMode))
    }
    if (wifiConfigs != null && wifiConfigs.length > 0) {
      wifiConfigs.forEach(wifiProfile => {
        cy.matListAssert('[data-cy="wifiConfigs"]', wifiProfile.profileName)
      })
    }
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
