/*********************************************************************
* Copyright (c) Intel Corporation 2022
* SPDX-License-Identifier: Apache-2.0
**********************************************************************/

import { ciraConfig } from 'cypress/e2e/fixtures/api/cira'
import { httpCodes } from 'cypress/e2e/fixtures/api/httpCodes'
import { wirelessConfigs } from 'cypress/e2e/fixtures/api/wireless'
import { testProfiles } from '../../fixtures/formEntry/profile'
import Constants from '../../../../src/app/shared/config/Constants'

function freshenGetProfilesIntercept (profiles: any[]): void {
  cy.myIntercept('GET', 'profiles?$top=25&$skip=0&$count=true', {
    statusCode: httpCodes.SUCCESS,
    body: {
      data: profiles,
      totalCount: profiles.length
    }
  }).as('get-profiles')
}
function freshenGetProfileIntercept (profile: any): void {
  cy.myIntercept('GET', profile.profileName,
    {
      statusCode: httpCodes.SUCCESS,
      body: profile
    })
    .as('get-profile')
}
function openProfileDetails (profile: any): void {
  freshenGetProfileIntercept(profile)
  cy.get('mat-cell').contains(profile.profileName).click()
  cy.wait('@get-profile')
    .its('response')
    .then(response => {
      cy.wrap(response).its('statusCode').should('eq', httpCodes.SUCCESS)
    })
  cy.wait('@get-ciraConfigs')
  cy.wait('@get-wirelessConfigs')
}
function saveProfileDetails (profile: any): void {
  cy.myIntercept('PATCH', 'profiles', {
    statusCode: httpCodes.SUCCESS,
    body: profile
  }).as('patch-profile')
  freshenGetProfilesIntercept([profile])
  cy.get('button[type=submit]').click()
  // clear the warning dialog
  if (!profile.dhcpEnabled && profile.ciraConfigName) {
    cy.get('button').contains('Continue').click()
  }
  cy.wait('@patch-profile')
    .its('response')
    .then(response => {
      cy.wrap(response).its('statusCode').should('eq', httpCodes.SUCCESS)
    })

  cy.wait('@get-profiles')
    .get('mat-cell').contains(profile.profileName)
    .next().should('contain.text', Constants.parseDhcpMode(profile.dhcpEnabled))
    .next().should('contain.text', (profile.ciraConfigName) ? profile.ciraConfigName : Constants.parseTlsMode(profile.tlsMode))
    .next().should('contain.text', profile.activation)
}
describe('Test Update Profile Page Update', () => {
  // Real stack execution order:
  // profile/create-tls.spec.ts,
  // wireless/create.spec.ts
  // profile/update-tls.spec.ts
  beforeEach('clear cache and login', () => {
    cy.setup()
    const testProfile = JSON.parse(JSON.stringify(testProfiles[0]))
    freshenGetProfilesIntercept([testProfile])
    cy.myIntercept('GET', 'ciraconfigs?$count=true', {
      statusCode: httpCodes.SUCCESS,
      body: ciraConfig.getAll.forProfile.response
    }).as('get-ciraConfigs')
    cy.myIntercept('GET', 'wirelessconfigs?$count=true', {
      statusCode: httpCodes.SUCCESS,
      body: wirelessConfigs.getAll.forProfile.response
    }).as('get-wirelessConfigs')
    cy.goToPage('Profiles')
    cy.wait('@get-profiles')
  })

  it('update activation mode should succeed', () => {
    const testProfile = JSON.parse(JSON.stringify(testProfiles[0]))
    expect(testProfile.activation).to.eq(Constants.ActivationModes.ADMIN.value)
    expect(testProfile.userConsent).to.eq(Constants.UserConsentModes.ALL.value)
    openProfileDetails(testProfile)
    // set the userConsent mode specifically BEFORE changing from ADMIN to CLIENT
    cy.matSelectChoose('[formControlName="userConsent"]', Constants.UserConsentModes.NONE.value)
    // setting activation to CLIENT should trigger automatic UserConsent change to ALL
    // which gets confirmed later
    testProfile.activation = Constants.ActivationModes.CLIENT.value
    cy.enterProfileInfo(testProfile, false, false)
    saveProfileDetails(testProfile)
    openProfileDetails(testProfile)
    cy.assertProfileInfo(testProfile)
  })

  it('update redirection features should succeed', () => {
    const testProfile = JSON.parse(JSON.stringify(testProfiles[0]))
    openProfileDetails(testProfile)
    testProfile.userConsent = Constants.UserConsentModes.NONE.value
    testProfile.iderEnabled = !testProfile.iderEnabled
    testProfile.kvmEnabled = !testProfile.kvmEnabled
    testProfile.solEnabled = !testProfile.solEnabled
    cy.enterProfileInfo(testProfile, false, false)
    saveProfileDetails(testProfile)
    openProfileDetails(testProfile)
    cy.assertProfileInfo(testProfile)
  })

  it('update DHCP mode should succeed', () => {
    const testProfile = JSON.parse(JSON.stringify(testProfiles[0]))
    openProfileDetails(testProfile)
    testProfile.dhcpEnabled = !testProfile.dhcpEnabled
    cy.enterProfileInfo(testProfile, false, false)
    saveProfileDetails(testProfile)
    openProfileDetails(testProfile)
    cy.assertProfileInfo(testProfile)
  })

  for (const [, tlsMode] of Object.entries(Constants.TlsModes)) {
    it(`update tls mode should succeed ${tlsMode.value}:${tlsMode.display}`, () => {
      const testProfile = JSON.parse(JSON.stringify(testProfiles[0]))
      openProfileDetails(testProfile)
      testProfile.ciraConfigName = null
      // sorry about the name-property mistmatch between object and Constant
      testProfile.tlsMode = tlsMode.value
      cy.enterProfileInfo(testProfile, false, false)
      saveProfileDetails(testProfile)
      openProfileDetails(testProfile)
      cy.assertProfileInfo(testProfile)
    })
  }
})
