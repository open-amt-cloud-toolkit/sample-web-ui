/*********************************************************************
 * Copyright (c) Intel Corporation 2021
 * SPDX-License-Identifier: Apache-2.0
 **********************************************************************/
// Tests the creation of a profile
import { profileFixtures } from '../../fixtures/profile'
import { apiResponses } from '../../fixtures/api/apiResponses'

// ---------------------------- Test section ----------------------------

describe('Test Profile Page', () => {
  beforeEach('clear cache and login', () => {
    cy.setup()
  })

  it('deletes static network config profile', () => {
    cy.myIntercept('DELETE', /.*profiles.*/, {
      statusCode: apiResponses.profiles.delete.success.code
    }).as('delete-profile')

    cy.myIntercept('GET', 'profiles?$top=25&$skip=0&$count=true', {
      statusCode: apiResponses.profiles.getAll.static.code,
      body: apiResponses.profiles.getAll.static.response
    }).as('get-profiles3')

    cy.goToPage('Profiles')
    cy.wait('@get-profiles3')

    cy.myIntercept('GET', 'profiles?$top=25&$skip=0&$count=true', {
      statusCode: apiResponses.profiles.getAll.empty.code,
      body: apiResponses.profiles.getAll.empty.response
    }).as('get-profiles4')

    // Delete profile
    cy.get('mat-row').contains(profileFixtures.happyPathStaticNetwork.profileName).parent().contains('delete').click()
    cy.get('button').contains('Yes').click()
    cy.wait('@delete-profile')
    cy.wait('@get-profiles4')

    cy.contains(profileFixtures.happyPathStaticNetwork.profileName).should('not.exist')
  })
})
