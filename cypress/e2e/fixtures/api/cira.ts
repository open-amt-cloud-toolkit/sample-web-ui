/*********************************************************************
* Copyright (c) Intel Corporation 2022
* SPDX-License-Identifier: Apache-2.0
**********************************************************************/

import { configs } from '../formEntry/cira'

export const allConfigsResponse = {
  data: configs,
  totalCount: configs.length
}

export const noConfigsResponse = {
  data: [],
  totalCount: 0
}

export const errorResponse = {
  error: 'string',
  message: 'string'
}

export function interceptGetAll (statusCode: number, body: any): Cypress.Chainable<Element> {
  return cy.myIntercept(
    'GET',
    'ciraconfigs?*$count=true',
    { statusCode, body }
  )
}

export function interceptPost (statusCode: number, body: any): Cypress.Chainable<Element> {
  return cy.myIntercept(
    'POST',
    'ciraconfigs',
    { statusCode, body }
  )
}

export function interceptDelete (statusCode: number, body: any): Cypress.Chainable<Element> {
  return cy.myIntercept(
    'DELETE',
    /.*ciraconfigs.*/,
    { statusCode, body }
  )
}

export function interceptCiraCert (statusCode: number, body: any): Cypress.Chainable<Element> {
  return cy.myIntercept(
    'GET',
    'ciracert',
    { statusCode, body }
  )
}
