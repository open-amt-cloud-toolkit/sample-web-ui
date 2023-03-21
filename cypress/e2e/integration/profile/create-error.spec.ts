/*********************************************************************
* Copyright (c) Intel Corporation 2022
* SPDX-License-Identifier: Apache-2.0
**********************************************************************/

// Tests the creation of a profile
import { badRequest } from 'cypress/e2e/fixtures/api/general'
import { httpCodes } from 'cypress/e2e/fixtures/api/httpCodes'
import { urlFixtures } from 'cypress/e2e/fixtures/formEntry/urls'

import * as apiProfile from 'cypress/e2e/fixtures/api/profile'
import * as apiWireless from 'cypress/e2e/fixtures/api/wireless'
import * as api8021x from 'cypress/e2e/fixtures/api/ieee8021x'
import * as apiCIRA from 'cypress/e2e/fixtures/api/cira'
import * as formEntryProfile from 'cypress/e2e/fixtures/formEntry/profile'

const baseUrl: string = Cypress.env('BASEURL')

// ---------------------------- Test section ----------------------------

describe('Test Profile Page', () => {
  beforeEach('clear cache and login', () => {
    cy.setup()
    apiCIRA.interceptGetAll(httpCodes.SUCCESS, apiCIRA.allConfigsResponse).as('apiCIRA.GetAll')
    apiWireless.interceptGetAll(httpCodes.SUCCESS, apiWireless.allConfigsResponse).as('apiWireless.GetAll')
    api8021x.interceptGetAll(httpCodes.SUCCESS, api8021x.allConfigsResponse).as('api8021x.GetAll')
    apiProfile.interceptGetAll(httpCodes.SUCCESS, apiProfile.noConfigsResponse).as('apiProfile.GetAll')
    cy.goToPage('Profiles')
    cy.get('button').contains('Add New').click()
    // cy.wait('@apiCIRA.GetAll')
    cy.wait('@apiWireless.GetAll')
    cy.wait('@api8021x.GetAll')
    cy.wait('@apiCIRA.GetAll')
      .its('response.statusCode')
      .should('be.oneOf', [200, 304])
  })

  it('invalid profile name', () => {
    const profile = { ...formEntryProfile.profiles[0] }
    profile.profileName = 'bad name !'
    cy.enterProfileInfo(profile)
    apiProfile.interceptPost(httpCodes.BAD_REQUEST, badRequest).as('post-profile2')
  })

  afterEach('Check for error', () => {
    cy.get('button[type=submit]').click()

    // Wait for requests to finish and check their responses
    cy.wait('@post-profile2').then((req) => {
      cy.wrap(req)
        .its('response.statusCode')
        .should('eq', httpCodes.BAD_REQUEST)
    })

    // Check that the profile creation failed
    cy.url().should('eq', baseUrl + urlFixtures.page.profile + '/' + urlFixtures.extensions.creation)
  })
})
