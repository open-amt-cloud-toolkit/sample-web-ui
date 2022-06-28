/*********************************************************************
* Copyright (c) Intel Corporation 2022
* SPDX-License-Identifier: Apache-2.0
**********************************************************************/

import { apiResponses, httpCodes } from '../../fixtures/api/apiResponses'
import { wirelessFixtures } from '../../fixtures/wireless'

describe('get a wireless profile', () => {
  beforeEach('clear cache and login', () => {
    cy.setup()
  })

  it('get a default profile', () => {
    cy.myIntercept('GET', 'wirelessconfigs?$top=25&$skip=0&$count=true', {
      statusCode: httpCodes.SUCCESS,
      body: apiResponses.wirelessConfigs.getAll.success.response
    }).as('get-wireless')
    cy.goToPage('Wireless')
    cy.wait('@get-wireless')
    cy.myIntercept('GET', `api/v1/admin/wirelessconfigs/${wirelessFixtures.happyPath.profileName}`, {
      statusCode: httpCodes.SUCCESS,
      body: wirelessFixtures.happyPath
    }).as('get-wireless-profile')
    cy.get('mat-cell').contains(wirelessFixtures.happyPath.profileName).click()
    cy.get("input[name='profileName']").should('have.value', wirelessFixtures.happyPath.profileName)
  })
})
