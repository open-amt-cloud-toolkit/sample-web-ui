/*********************************************************************
* Copyright (c) Intel Corporation 2022
* SPDX-License-Identifier: Apache-2.0
**********************************************************************/

import { httpCodes } from 'cypress/e2e/fixtures/api/httpCodes'
import * as formEntry from 'cypress/e2e/fixtures/formEntry/ieee8021x'
import * as api from 'cypress/e2e/fixtures/api/ieee8021x'
import * as ieee8021x from 'src/app/ieee8021x/ieee8021x.constants'

describe('Test IEEE 8021x Creation', () => {
  const createdConfigs: ieee8021x.Config[] = []
  const allConfigs = [...formEntry.wiredConfigs, ...formEntry.wirelessConfigs]

  beforeEach('clear cache and login', () => {
    cy.setup()
    api
      .interceptGetAll(httpCodes.SUCCESS, api.noConfigsResponse)
      .as('api.GetAll')
    cy.goToPage('IEEE 802.1x')
    cy.get('button').contains('Add New').click()
  })

  allConfigs.forEach((config) => {
    it(`should create config ${config.profileName}`, () => {
      createdConfigs.push(config)
      api.interceptPost(httpCodes.CREATED, config).as('api.Post')
      const expectedRsp = { data: createdConfigs, totalCount: createdConfigs.length }
      api.interceptGetAll(httpCodes.SUCCESS, expectedRsp).as('api.GetAll')
      cy.enterIEEE8021xInfo(config)
      cy.get('button[type=submit]').click()
      cy.wait('@api.Post').its('response.statusCode').should('eq', httpCodes.CREATED)
      cy.wait('@api.GetAll')
      cy.get('mat-cell').contains(config.profileName)
      cy.get('mat-cell').contains(ieee8021x.AuthenticationProtocols.labelForValue(config.authenticationProtocol))
    })
  })
})
