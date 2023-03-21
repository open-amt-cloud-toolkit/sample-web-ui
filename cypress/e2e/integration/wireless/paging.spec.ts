/*********************************************************************
* Copyright (c) Intel Corporation 2022
* SPDX-License-Identifier: Apache-2.0
**********************************************************************/

import { httpCodes } from 'cypress/e2e/fixtures/api/httpCodes'
import * as api from 'cypress/e2e/fixtures/api/wireless'
import * as wireless from 'src/app/wireless/wireless.constants'

describe('Test Wireless Page Paging', () => {
  const TotalCount = 100
  const pageResponse: wireless.ConfigsResponse = {
    ...api.allConfigsResponse,
    totalCount: TotalCount
  }
  const expectedLabel01 = `1 – 25 of ${TotalCount}`
  const expectedLabel02 = `26 – 50 of ${TotalCount}`
  const expectedLabel03 = `51 – 75 of ${TotalCount}`
  const expectedLabel04 = `76 – 100 of ${TotalCount}`

  beforeEach('clear cache and login', () => {
    cy.setup()
    api.interceptGetAll(httpCodes.SUCCESS, pageResponse).as('apiGetAll')
  })

  it('should pass for next, last, previous, first', () => {
    cy.goToPage('Wireless')
    cy.wait('@apiGetAll')
    cy.get('.mat-paginator').find('.mat-paginator-range-label').contains(expectedLabel01)

    cy.get('.mat-paginator').find('button.mat-paginator-navigation-next.mat-icon-button').click()
    cy.wait('@apiGetAll')
    cy.get('.mat-paginator').find('.mat-paginator-range-label').contains(expectedLabel02)

    cy.get('.mat-paginator').find('button.mat-paginator-navigation-next.mat-icon-button').click()
    cy.wait('@apiGetAll')
    cy.get('.mat-paginator').find('.mat-paginator-range-label').contains(expectedLabel03)

    cy.get('.mat-paginator').find('button.mat-paginator-navigation-next.mat-icon-button').click()
    cy.wait('@apiGetAll')
    cy.get('.mat-paginator').find('.mat-paginator-range-label').contains(expectedLabel04)

    // check that next is not available now?
    cy.get('.mat-paginator').find('button.mat-paginator-navigation-previous.mat-icon-button').click()
    cy.wait('@apiGetAll')
    cy.get('.mat-paginator').find('.mat-paginator-range-label').contains(expectedLabel03)

    cy.get('.mat-paginator').find('button.mat-paginator-navigation-previous.mat-icon-button').click()
    cy.wait('@apiGetAll')
    cy.get('.mat-paginator').find('.mat-paginator-range-label').contains(expectedLabel02)

    cy.get('.mat-paginator').find('button.mat-paginator-navigation-previous.mat-icon-button').click()
    cy.wait('@apiGetAll')
    cy.get('.mat-paginator').find('.mat-paginator-range-label').contains(expectedLabel01)

    cy.get('.mat-paginator').find('button.mat-paginator-navigation-last.mat-icon-button').click()
    cy.wait('@apiGetAll')
    cy.get('.mat-paginator').find('.mat-paginator-range-label').contains(expectedLabel04)

    cy.get('.mat-paginator').find('button.mat-paginator-navigation-first.mat-icon-button').click()
    cy.wait('@apiGetAll')
    cy.get('.mat-paginator').find('.mat-paginator-range-label').contains(expectedLabel01)
  })
})
