/*********************************************************************
* Copyright (c) Intel Corporation 2022
* SPDX-License-Identifier: Apache-2.0
**********************************************************************/

// Tests the creation of a profile
import { ciraConfig } from 'cypress/e2e/fixtures/api/cira'
import { empty } from 'cypress/e2e/fixtures/api/general'
import { httpCodes } from 'cypress/e2e/fixtures/api/httpCodes'
import { profiles } from 'cypress/e2e/fixtures/api/profile'
import { wirelessConfigs } from 'cypress/e2e/fixtures/api/wireless'
import { testProfiles } from '../../fixtures/formEntry/profile'
import Constants from '../../../../src/app/shared/config/Constants'

// ---------------------------- Test section ----------------------------

describe('Test Profile Page', () => {
  beforeEach('clear cache and login', () => {
    cy.setup()
    // Stub the get and post requests
    cy.myIntercept('GET', 'ciraconfigs?$count=true', {
      statusCode: httpCodes.SUCCESS,
      body: ciraConfig.getAll.forProfile.response
    }).as('get-configs')

    cy.myIntercept('GET', 'wirelessconfigs?$count=true', {
      statusCode: httpCodes.SUCCESS,
      body: wirelessConfigs.getAll.forProfile.response
    }).as('get-wirelessConfigs')

    cy.myIntercept('POST', 'profiles', {
      statusCode: httpCodes.CREATED,
      body: profiles.create.success.response
    }).as('post-profile')

    cy.myIntercept('GET', 'profiles?$top=25&$skip=0&$count=true', {
      statusCode: httpCodes.SUCCESS,
      body: empty.response
    }).as('get-profiles')

    cy.goToPage('Profiles')
    cy.wait('@get-profiles')

    // change api response
    cy.myIntercept('GET', 'profiles?$top=25&$skip=0&$count=true', {
      statusCode: httpCodes.SUCCESS,
      body: profiles.getAll.success.response
    }).as('get-profiles2')

    // Fill out the profile
    cy.get('button').contains('Add New').click()
    cy.wait('@get-configs')
    cy.wait('@get-wirelessConfigs')
  })

  testProfiles.forEach((profile) => {
    it(`creates the profile - ${profile.profileName as string}`, () => {
      cy.log(profile)
      cy.enterProfileInfo(
        profile.profileName,
        profile.activationMode,
        false,
        false,
        profile.dhcpEnabled,
        profile.connectionMode,
        profile.connectionSelection,
        profile.userConsent,
        profile.iderEnabled,
        profile.kvmEnabled,
        profile.solEnabled,
        profile.wifiConfigs
      )
      cy.get('button[type=submit]').click()
      if (!profile.dhcpEnabled && profile.connectionMode === 'CIRA (Cloud)') {
        cy.get('button').contains('Continue').click()
      }
      cy.wait('@post-profile')
        .its('response')
        .then(response => {
          cy.wrap(response).its('statusCode').should('eq', httpCodes.CREATED)
        })
      cy.wait('@post-profile').then((interception) => {
        cy.wrap(interception)
          .its('response.statusCode')
          .should('eq', httpCodes.CREATED)

        // Check that the config was successful
        cy.get('mat-cell').contains(profile.profileName)
        cy.get('mat-cell').contains(Constants.parseDhcpMode(profile.dhcpEnabled))
        cy.get('mat-cell').contains(profile.connectionMode)
        cy.get('mat-cell').contains(profile.activationMode)
      })
    })
  })
})
