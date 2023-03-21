/*********************************************************************
* Copyright (c) Intel Corporation 2022
* SPDX-License-Identifier: Apache-2.0
**********************************************************************/

import * as formEntry from 'cypress/e2e/fixtures/formEntry/profile'
import * as profiles from 'src/app/profiles/profiles.constants'

export const allConfigsResponse: profiles.ProfilesResponse = {
  data: formEntry.profiles,
  totalCount: formEntry.profiles.length
}

export const noConfigsResponse: profiles.ProfilesResponse = {
  data: [],
  totalCount: 0
}

export function interceptGetAll (statusCode: number, body: any): Cypress.Chainable<Element> {
  return cy.myIntercept(
    'GET',
    'profiles?*$count=true',
    { statusCode, body }
  )
}

export function interceptPost (statusCode: number, body: any): Cypress.Chainable<Element> {
  return cy.myIntercept(
    'POST',
    'profiles',
    { statusCode, body }
  )
}

export function interceptDelete (statusCode: number, body: any): Cypress.Chainable<Element> {
  return cy.myIntercept(
    'DELETE',
    /.*profiles.*/,
    { statusCode, body }
  )
}
