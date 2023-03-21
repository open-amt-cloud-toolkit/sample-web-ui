/*********************************************************************
* Copyright (c) Intel Corporation 2022
* SPDX-License-Identifier: Apache-2.0
**********************************************************************/

// eslint-disable-next-line @typescript-eslint/triple-slash-reference
/// <reference types="cypress" />

import { httpCodes } from 'cypress/e2e/fixtures/api/httpCodes'
import stats from 'cypress/e2e/fixtures/api/stats'
import * as ieee8021x from 'src/app/ieee8021x/ieee8021x.constants'
import * as profiles from 'src/app/profiles/profiles.constants'
import * as wireless from 'src/app/wireless/wireless.constants'
import * as cira from 'src/app/configs/configs.constants'

declare global {
  namespace Cypress {
    interface Chainable {
      matCheckboxSet: (selector: string, checked: boolean) => Chainable<Element>
      matCheckboxAssert: (selector: string, checked: boolean) => Chainable<Element>
      matListAssert: (selector: string, value: string) => Chainable<Element>
      matRadioButtonChoose: (selector: string, value: string | number | boolean) => Chainable<Element>
      matRadioButtonAssert: (selector: string, value: string) => Chainable<Element>
      matSelectChoose: (selector: string, value: string) => Chainable<Element>
      matSelectAssert: (selector: string, value: string) => Chainable<Element>
      matTextlikeInputType: (selector: string, value: string) => Chainable<Element>
      matTextlikeInputAssert: (selector: string, value: string) => Chainable<Element>
      matFormFieldAssertInvalid: (formControlName: string, expected: boolean) => Chainable<Element>
      setup: () => Chainable<Element>
      login: (user: string, password: string) => Chainable<Element>
      myIntercept: (method: string, url: string | RegExp, body: any) => Chainable<Element>
      goToPage: (pageName: string) => Chainable<Element>
      enterCiraInfo: (config: cira.Config) => Chainable<Element>
      enterDomainInfo: (name: string, domain: string, file: Cypress.FileReference, pass: string) => Chainable<Element>
      enterWirelessInfo: (config: wireless.Config) => Chainable<Element>
      enterIEEE8021xInfo: (config: ieee8021x.Config) => Chainable<Element>
      enterProfileInfo: (profile: profiles.Profile) => Chainable<Element>
      assertProfileInfo: (profile: profiles.Profile) => Chainable<Element>
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

Cypress.Commands.add('matFormFieldAssertInvalid', (formControlName: string, expected: boolean) => {
  const expectedCondition = expected ? 'have.class' : 'not.have.class'
  cy.get(`[formcontrolname="${formControlName}"]`).parents('mat-form-field').should(expectedCondition, 'mat-form-field-invalid')
})

Cypress.Commands.add('matListAssert', (selector: string, value: string) => {
  cy.get(`mat-list${selector}`).get('mat-list-item').should('contain.text', value)
})

Cypress.Commands.add('matRadioButtonChoose', (selector: string, value: string | number | boolean) => {
  const elementId = `mat-radio-group${selector}`
  cy.get(elementId).invoke('is', ':disabled').then(isDisabled => {
    if (!isDisabled) {
      cy.get(elementId).within(() => {
        cy.get(`:radio[value="${value.toString()}"]`).click({ force: true })
      })
      // these low level radio buttons are hidden so need to force
      // cy.get(elementId).find('[type="radio"]').find(`[value="${value}"]`).click({ force: true })
      // cy.get(elementId).children('input').find(`[value="${value}"]`).click({ force: true })
    }
  })
})

Cypress.Commands.add('matRadioButtonAssert', (selector: string, value: string) => {
  // use 'include' rather than have as the styling
  // this does use a css class for the find, but not sure of a better way to find the radio button
  cy.get(`mat-radio-group${selector}`).find('.mat-radio-checked').find(':radio').should('have.attr', 'value', value)
})

Cypress.Commands.add('matSelectChoose', (selector: string, text: string) => {
  const elementId = `mat-select${selector}`
  cy.get(elementId).invoke('hasClass', 'mat-select-disabled').then(isDisabled => {
    if (!isDisabled) {
      cy.get(elementId).click().get('.mat-option-text').contains(text).click()
      cy.get(elementId).focus().type('{esc}')
      cy.get(elementId).should('have.text', text)
    }
  })
})

Cypress.Commands.add('matSelectAssert', (selector: string, text: string) => {
  const elementId = `mat-select${selector}`
  cy.get(elementId).should('have.text', text)
})

Cypress.Commands.add('matTextlikeInputType', (selector: string, value: string) => {
  cy.get(selector).invoke('is', ':disabled').then(isDisabled => {
    if (!isDisabled) {
      cy.get(selector).invoke('is', ':visible').then(isVisible => {
        if (isVisible) {
          cy.get(selector).clear().type(value).blur()
        }
      })
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
    body: stats.get.success.response
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

Cypress.Commands.add('enterCiraInfo', (config: cira.Config) => {
  cy.matTextlikeInputType('[formControlName="configName"]', config.configName)
  cy.matRadioButtonChoose('[formControlName="serverAddressFormat"]', config.serverAddressFormat)
  cy.matTextlikeInputType('[formControlName="mpsServerAddress"]', config.mpsServerAddress)
  cy.matTextlikeInputType('[formControlName="commonName"]', config.commonName)
  cy.matTextlikeInputType('[formControlName="mpsPort"]', config.mpsPort.toString())
  cy.matTextlikeInputType('[formControlName="username"]', config.username)
})

// TODO: add assertCiraInfo

Cypress.Commands.add('enterProfileInfo', (profile: profiles.Profile) => {
  const activationLabel = profiles.ActivationModes.labelForValue(profile.activation)
  cy.matTextlikeInputType('[formControlName="profileName"]', profile.profileName)
  cy.matSelectChoose('[formControlName="activation"]', activationLabel)
  cy.matSelectChoose('[formControlName="userConsent"]', profile.userConsent)
  cy.matCheckboxSet('[formControlName="iderEnabled"]', profile.iderEnabled)
  cy.matCheckboxSet('[formControlName="kvmEnabled"]', profile.kvmEnabled)
  cy.matCheckboxSet('[formControlName="solEnabled"]', profile.solEnabled)
  cy.matCheckboxSet('[formControlName="generateRandomPassword"]', profile.generateRandomPassword)
  if (!profile.generateRandomPassword) {
    cy.matTextlikeInputType('[formControlName="amtPassword"]', Cypress.env('AMT_PASSWORD'))
  }
  cy.matCheckboxSet('[formControlName="generateRandomMEBxPassword"]', profile.generateRandomMEBxPassword)
  if (!profile.generateRandomMEBxPassword) {
    cy.matTextlikeInputType('[formControlName="mebxPassword"]', Cypress.env('MEBX_PASSWORD'))
  }
  cy.matRadioButtonChoose('[formControlName="dhcpEnabled"]', profile.dhcpEnabled)
  if (profile.ieee8021xProfileName) {
    cy.matSelectChoose('[formControlName="ieee8021xProfileName"]', profile.ieee8021xProfileName)
  }

  if (profile.ciraConfigName) {
    cy.matRadioButtonChoose('[name="connectionMode"]', profiles.ConnectionModes.CIRA.value)
    cy.matSelectChoose('[formControlName="ciraConfigName"]', profile.ciraConfigName)
  } else if (profile.tlsMode) {
    cy.matRadioButtonChoose('[name="connectionMode"]', profiles.ConnectionModes.TLS.value)
    cy.matSelectChoose('[formControlName="tlsMode"]', profiles.TlsModes.labelForValue(profile.tlsMode))
    if (profile.tlsSigningAuthority) {
      const l = profiles.TlsSigningAuthorities.labelForValue(profile.tlsSigningAuthority)
      cy.matSelectChoose('[formControlName="tlsSigningAuthority"]', l)
    }
  }
  if (profile.wifiConfigs != null && profile.wifiConfigs.length > 0) {
    profile.wifiConfigs.forEach((wifiProfile: { profileName: string | number | RegExp }) => {
      cy.matTextlikeInputType('[data-cy=wifiAutocomplete]', wifiProfile.profileName as string)
      // cy.get('input[data-cy=wifiAutocomplete]').type(wifiProfile.profileName)
      cy.get('mat-option').contains(wifiProfile.profileName).click()
    })
  }
})

Cypress.Commands.add('assertProfileInfo', (profile: any) => {
  cy.matTextlikeInputAssert('[formControlName="profileName"]', profile.profileName)
  cy.matSelectAssert('[formControlName="activation"]', profile.activation)
  cy.matSelectAssert('[formControlName="userConsent"]', profile.userConsent)
  cy.matCheckboxAssert('[formControlName="iderEnabled"]', profile.iderEnabled)
  cy.matCheckboxAssert('[formControlName="kvmEnabled"]', profile.kvmEnabled)
  cy.matCheckboxAssert('[formControlName="solEnabled"]', profile.solEnabled)
  cy.matRadioButtonAssert('[formControlName="dhcpEnabled"]', profile.dhcpEnabled ? 'true' : 'false')
    if (profile.ieee8021xProfileName) {
    cy.matSelectAssert('[formControlName="ieee8021xProfileName"]', profile.ieee8021xProfileName)
  }

  if (profile.ciraConfigName) {
    cy.matRadioButtonAssert('[name="connectionMode"]', profiles.ConnectionModes.CIRA.value)
    cy.matSelectAssert('[formControlName="ciraConfigName"]', profile.ciraConfigName)
  }
  if (profile.tlsMode) {
    cy.matRadioButtonAssert('[name="connectionMode"]', profiles.ConnectionModes.TLS.value)
    cy.matSelectAssert('[formControlName="tlsMode"]', profile.tlsMode)
  }
  if (profile.wifiConfigs != null && profile.wifiConfigs.length > 0) {
    profile.wifiConfigs.forEach((wifiProfile: { profileName: string }) => {
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

Cypress.Commands.add('enterWirelessInfo', (config: wireless.Config) => {
  cy.matTextlikeInputType('[formControlName="profileName"]', config.profileName)
  cy.matTextlikeInputType('[formControlName="ssid"]', config.ssid)
  cy.matSelectChoose(
    '[formControlName="authenticationMethod"]',
    wireless.AuthenticationMethods.labelForValue(config.authenticationMethod))
  cy.matSelectChoose(
    '[formControlName="encryptionMethod"]',
    wireless.EncryptionMethods.labelForValue(config.encryptionMethod))
   if (config.pskPassphrase) {
    cy.matTextlikeInputType('[formControlName="pskPassphrase"]', config.pskPassphrase)
   }
   if (config.ieee8021xProfileName) {
     cy.matSelectChoose('[formControlName="ieee8021xProfileName"]', config.ieee8021xProfileName)
   }
})

Cypress.Commands.add('enterIEEE8021xInfo', (config: ieee8021x.Config) => {
  cy.matRadioButtonChoose('[formControlName="wiredInterface"]', config.wiredInterface)
  if (config.profileName != null) {
    cy.matTextlikeInputType('[formControlName="profileName"]', config.profileName)
  }
  if (config.authenticationProtocol != null) {
    cy.matSelectChoose(
      '[formControlName="authenticationProtocol"]',
      ieee8021x.AuthenticationProtocols.labelForValue(config.authenticationProtocol))
  }
  if (config.pxeTimeout != null) {
    cy.matTextlikeInputType('[formControlName="pxeTimeout"]', config.pxeTimeout.toString())
  }
})

// ------------------------- Common Navigation --------------------------

Cypress.Commands.add('goToPage', (pageName) => {
  cy.get('.mat-list-item').contains(pageName).click()
})

Cypress.Commands.add('setAMTMEBXPasswords', (mode, amtPassword, mebxPassword) => {
  // cy.get('[formControlName=generateRandomPassword]').click()
  cy.get('input').get('[formControlName=amtPassword]').type(amtPassword)
  if (mode === 'acmactivate') {
    // cy.get('[formControlName=generateRandomMEBxPassword]').click()
    cy.get('input').get('[formControlName=mebxPassword]').type(mebxPassword)
  }
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
