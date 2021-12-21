/*********************************************************************
 * Copyright (c) Intel Corporation 2021
 * SPDX-License-Identifier: Apache-2.0
 **********************************************************************/
// Tests the creation of a profile
import { profileFixtures } from '../../fixtures/profile'
import { apiResponses } from '../../fixtures/api/apiResponses'

describe('Test Profile Page', () => {
  beforeEach('clear cache and login', () => {
    cy.setup()
    // Stub the get and post requests
    cy.myIntercept('GET', 'ciraconfigs?$count=true', {
      statusCode: apiResponses.ciraConfigs.getAll.forProfile.code,
      body: apiResponses.ciraConfigs.getAll.forProfile.response
    }).as('get-configs')

    cy.myIntercept('GET', 'wirelessconfigs?$count=true', {
      statusCode: apiResponses.wirelessConfigs.getAll.forProfile.code,
      body: apiResponses.wirelessConfigs.getAll.forProfile.response
    }).as('get-wirelessConfigs')

    cy.myIntercept('POST', 'profiles', {
      statusCode: apiResponses.profiles.create.success.code,
      body: apiResponses.profiles.create.success.response
    }).as('post-profile')

    cy.myIntercept('GET', 'profiles?$top=25&$skip=0&$count=true', {
      statusCode: apiResponses.profiles.getAll.empty.code,
      body: apiResponses.profiles.getAll.empty.response
    }).as('get-profiles')

    cy.goToPage('Profiles')
    cy.wait('@get-profiles')

    // change api response
    cy.myIntercept('GET', 'profiles?$top=25&$skip=0&$count=true', {
      statusCode: apiResponses.profiles.getAll.success.code,
      body: apiResponses.profiles.getAll.success.response
    }).as('get-profiles2')

    // Fill out the profile
    cy.get('button').contains('Add New').click()
    cy.wait('@get-configs')
    cy.wait('@get-wirelessConfigs')
  })

  it('should create a profile with static AMT password and random MEBx password with TLS config', () => {
    cy.myIntercept('POST', 'profiles', {
      statusCode: apiResponses.profiles.create.success.code,
      body: apiResponses.profiles.create.success.response
    }).as('post-profile2')

    cy.myIntercept('GET', 'profiles?$top=25&$skip=0&$count=true', {
      statusCode: apiResponses.profiles.getAll.tlsrandommebxpwd.code,
      body: apiResponses.profiles.getAll.tlsrandommebxpwd.response
    }).as('get-profiles2')
    cy.enterProfileInfo(
      profileFixtures.happyPathTlsRandomMebxPwd.profileName,
      profileFixtures.happyPathTlsRandomMebxPwd.activation,
      false,
      true,
      profileFixtures.happyPathTlsRandomMebxPwd.dhcpEnabled,
      profileFixtures.happyPathTlsRandomMebxPwd.connectionMode,
      profileFixtures.happyPathTlsRandomMebxPwd.tlsConfig
    )
    cy.get('input').get('[formControlName=mebxPassword]').should('not.be.visible')
    cy.get('button[type=submit]').click()
    cy.get('button').contains('Continue').click()

    cy.wait('@post-profile2').then((req) => {
      cy.wrap(req)
        .its('response.statusCode')
        .should('eq', apiResponses.profiles.create.success.code)

      // Check that the config was successful
      cy.get('mat-cell').contains(profileFixtures.happyPathTlsRandomMebxPwd.profileName)
      cy.get('mat-cell').contains(profileFixtures.check.network.dhcp.toString())
      cy.get('mat-cell').contains(profileFixtures.check.mode.ccm)
    })

    cy.wait('@get-profiles2')
      .its('response.statusCode')
      .should('eq', apiResponses.profiles.getAll.success.code)
  })
})
