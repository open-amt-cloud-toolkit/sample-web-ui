/*********************************************************************
* Copyright (c) Intel Corporation 2022
* SPDX-License-Identifier: Apache-2.0
**********************************************************************/

import { httpCodes } from 'cypress/e2e/fixtures/api/httpCodes'
import * as apiProfile from 'cypress/e2e/fixtures/api/profile'
import * as profiles from 'src/app/profiles/profiles.constants'

describe('Test Profile Page Paging', () => {
  const TotalCount = 100
  const pageResponse: profiles.ProfilesResponse = {
    ...apiProfile.allConfigsResponse,
    totalCount: TotalCount
  }
  const expectedLabel01 = `1 – 25 of ${TotalCount}`
  const expectedLabel02 = `26 – 50 of ${TotalCount}`
  const expectedLabel03 = `51 – 75 of ${TotalCount}`
  const expectedLabel04 = `76 – 100 of ${TotalCount}`

  beforeEach('clear cache and login', () => {
    cy.setup()
    apiProfile.interceptGetAll(httpCodes.SUCCESS, pageResponse).as('apiProfile.GetAll')
  })

  it('should pass for next, last, previous, first', () => {
    cy.goToPage('Profiles')
    cy.wait('@apiProfile.GetAll')
    cy.get('.mat-paginator').find('.mat-paginator-range-label').contains(expectedLabel01)

    cy.get('.mat-paginator').find('button.mat-paginator-navigation-next.mat-icon-button').click()
    cy.wait('@apiProfile.GetAll')
    cy.get('.mat-paginator').find('.mat-paginator-range-label').contains(expectedLabel02)

    cy.get('.mat-paginator').find('button.mat-paginator-navigation-next.mat-icon-button').click()
    cy.wait('@apiProfile.GetAll')
    cy.get('.mat-paginator').find('.mat-paginator-range-label').contains(expectedLabel03)

    cy.get('.mat-paginator').find('button.mat-paginator-navigation-next.mat-icon-button').click()
    cy.wait('@apiProfile.GetAll')
    cy.get('.mat-paginator').find('.mat-paginator-range-label').contains(expectedLabel04)

    // check that next is not available now?
    cy.get('.mat-paginator').find('button.mat-paginator-navigation-previous.mat-icon-button').click()
    cy.wait('@apiProfile.GetAll')
    cy.get('.mat-paginator').find('.mat-paginator-range-label').contains(expectedLabel03)

    cy.get('.mat-paginator').find('button.mat-paginator-navigation-previous.mat-icon-button').click()
    cy.wait('@apiProfile.GetAll')
    cy.get('.mat-paginator').find('.mat-paginator-range-label').contains(expectedLabel02)

    cy.get('.mat-paginator').find('button.mat-paginator-navigation-previous.mat-icon-button').click()
    cy.wait('@apiProfile.GetAll')
    cy.get('.mat-paginator').find('.mat-paginator-range-label').contains(expectedLabel01)

    cy.get('.mat-paginator').find('button.mat-paginator-navigation-last.mat-icon-button').click()
    cy.wait('@apiProfile.GetAll')
    cy.get('.mat-paginator').find('.mat-paginator-range-label').contains(expectedLabel04)

    cy.get('.mat-paginator').find('button.mat-paginator-navigation-first.mat-icon-button').click()
    cy.wait('@apiProfile.GetAll')
    cy.get('.mat-paginator').find('.mat-paginator-range-label').contains(expectedLabel01)
  })
})
