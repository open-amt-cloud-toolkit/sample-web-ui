/*********************************************************************
* Copyright (c) Intel Corporation 2022
* SPDX-License-Identifier: Apache-2.0
**********************************************************************/

import { ciraConfig } from 'cypress/e2e/fixtures/api/cira'
import { httpCodes } from 'cypress/e2e/fixtures/api/httpCodes'
import { profiles } from 'cypress/e2e/fixtures/api/profile'
import { wirelessConfigs } from 'cypress/e2e/fixtures/api/wireless'
import { testProfiles } from '../../fixtures/formEntry/profile'
import Constants from '../../../../src/app/shared/config/Constants'

describe('Test Profile Page Creation', () => {
  const postResponse: any = {
    data: [],
    totalCount: 0
  }

  beforeEach('clear cache and login', () => {
    cy.setup()

    // this first get-profiles will be empty
    cy.myIntercept('GET', 'profiles?$top=25&$skip=0&$count=true', {
      statusCode: httpCodes.SUCCESS,
      body: {
        data: [],
        totalCount: 0
      }
    }).as('get-profiles')

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
    it(`creates the profile - ${testProfile.profileName as string}`, () => {
      cy.log(testProfile)
      cy.matTextlikeInputType('[formControlName="profileName"]', testProfile.profileName)
      cy.enterProfileInfo(testProfile, false, false)
      cy.myIntercept('POST', 'profiles', {
        statusCode: httpCodes.CREATED,
        body: {
          profileName: testProfile.profileName,
          activation: testProfile.activation,
          ciraConfigName: testProfile.ciraConfigName,
          dhcpEnabled: testProfile.dhcpEnabled,
          tlsMode: testProfile.tlsMode
        }
      }).as('post-profile')

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

      cy.assertProfileInfo(testProfile)
    })
  })

  it('create profile error - invalid profile name', () => {
    const testProfile = JSON.parse(JSON.stringify(testProfiles[0]))
    testProfile.profileName = 'bad name !'
    cy.matTextlikeInputType('[formControlName="profileName"]', testProfile.profileName)
    cy.enterProfileInfo(testProfile, false, false)
    cy.myIntercept('POST', 'profiles', {
      statusCode: httpCodes.BAD_REQUEST,
      body: {
        errors: [
          {
            value: 'bad name !',
            msg: 'AMT profile name accepts letters, numbers, special characters and no spaces',
            param: 'profileName',
            location: 'body'
          }
        ]
      }
    }).as('post-profile')
    cy.get('button[type=submit]').click()
    cy.wait('@post-profile')
      .its('response')
      .then(response => {
        cy.wrap(response).its('statusCode').should('eq', httpCodes.BAD_REQUEST)
      })
  })
})
