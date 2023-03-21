/*********************************************************************
* Copyright (c) Intel Corporation 2022
* SPDX-License-Identifier: Apache-2.0
**********************************************************************/

import { configs } from 'cypress/e2e/fixtures/formEntry/wireless'
import { Config } from 'src/app/wireless/wireless.constants'
import { DataWithCount } from 'src/models/models'

export const allConfigsResponse: DataWithCount<Config> = {
  data: configs,
  totalCount: configs.length
}

export const noConfigsResponse: DataWithCount<Config> = {
  data: [],
  totalCount: 0
}

export function interceptGetAll (statusCode: number, body: any): Cypress.Chainable<Element> {
  return cy.myIntercept(
    'GET',
    'wirelessconfigs?*$count=true',
    { statusCode, body }
  )
}

export function interceptPost (statusCode: number, body: any): Cypress.Chainable<Element> {
  return cy.myIntercept(
    'POST',
    'wirelessconfigs',
    { statusCode, body }
  )
}

export function interceptDelete (statusCode: number, body: any): Cypress.Chainable<Element> {
  return cy.myIntercept(
    'DELETE',
    /.*wirelessconfigs.*/,
    { statusCode, body }
  )
}
