/*********************************************************************
* Copyright (c) Intel Corporation 2022
* SPDX-License-Identifier: Apache-2.0
**********************************************************************/

// Tests the creation of a profile
import { ciraConfig } from 'cypress/e2e/fixtures/api/cira'
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
    }).as('get-ciraConfigs')

    cy.myIntercept('GET', 'wirelessconfigs?$count=true', {
      statusCode: httpCodes.SUCCESS,
      body: wirelessConfigs.getAll.forProfile.response
    }).as('get-wirelessConfigs')

    cy.myIntercept('POST', 'profiles', {
      statusCode: httpCodes.CREATED,
      body: profiles.create.success.response
    }).as('post-profile')

    // this first get-profiles will be empty
    cy.myIntercept('GET', 'profiles?$top=25&$skip=0&$count=true', {
      statusCode: httpCodes.SUCCESS,
      body: {
        data: [],
        totalCount: 0
      }
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
    cy.wait('@get-ciraConfigs')
    cy.wait('@get-wirelessConfigs')
  })

  testProfiles.forEach((testProfile) => {
    const postResponse: any = {
      data: [],
      totalCount: 0
    }
    it(`creates the profile - ${testProfile.profileName as string}`, () => {
      cy.log(testProfile)
      cy.enterProfileInfo(
        testProfile.profileName,
        testProfile.activation,
        testProfile.userConsent,
        testProfile.iderEnabled,
        testProfile.kvmEnabled,
        testProfile.solEnabled,
        false,
        false,
        testProfile.dhcpEnabled,
        testProfile.ciraConfigName,
        testProfile.tlsMode,
        testProfile.wifiConfigs
      )
      postResponse.data.push(testProfile)
      postResponse.totalCount = postResponse.data.length
      cy.myIntercept('GET', 'profiles?$top=25&$skip=0&$count=true', {
        statusCode: httpCodes.SUCCESS,
        body: postResponse
      }).as('get-profiles')

      cy.get('button[type=submit]').click()
      // clear the warning dialog
      if (!testProfile.dhcpEnabled && testProfile.ciraConfigName) {
        cy.get('button').contains('Continue').click()
      }

      cy.wait('@post-profile')
        .its('response')
        .then(response => {
          cy.wrap(response).its('statusCode').should('eq', httpCodes.CREATED)
        })
      // Check that the config was successful
      cy.wait('@get-profiles')
      cy.get('mat-cell').contains(testProfile.profileName)
      cy.get('mat-cell').contains(Constants.parseDhcpMode(testProfile.dhcpEnabled))
      if (testProfile.ciraConfigName) {
        cy.get('mat-cell').contains(testProfile.ciraConfigName)
      }
      if (testProfile.tlsMode) {
        cy.get('mat-cell').contains(Constants.parseTlsMode(testProfile.tlsMode))
      }
      cy.get('mat-cell').contains(testProfile.activation)

      // setup the get response based on the profile clicked
      cy.myIntercept('GET', testProfile.profileName, {
        statusCode: httpCodes.SUCCESS,
        body: testProfile
      }).as('get-test-profile')

      cy.contains('mat-row', testProfile.profileName).click()
      cy.wait('@get-test-profile')
        .its('response')
        .then(response => {
          cy.wrap(response).its('statusCode').should('eq', httpCodes.SUCCESS)
        })

      cy.assertProfileInfo(
        testProfile.profileName,
        testProfile.activation,
        testProfile.userConsent,
        testProfile.iderEnabled,
        testProfile.kvmEnabled,
        testProfile.solEnabled,
        false,
        false,
        testProfile.dhcpEnabled,
        testProfile.ciraConfigName,
        testProfile.tlsMode,
        testProfile.wifiConfigs
      )
    })
  })
})
