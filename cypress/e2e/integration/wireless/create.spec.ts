/*********************************************************************
* Copyright (c) Intel Corporation 2022
* SPDX-License-Identifier: Apache-2.0
**********************************************************************/

import { httpCodes } from 'cypress/e2e/fixtures/api/httpCodes'
import * as api from 'cypress/e2e/fixtures/api/wireless'
import * as formEntry from 'cypress/e2e/fixtures/formEntry/wireless'
import * as wireless from 'src/app/wireless/wireless.constants'
import * as api8021x from 'cypress/e2e/fixtures/api/ieee8021x'

describe('Test Wireless Config Creation', () => {
  beforeEach('clear cache and login', () => {
    cy.setup()
    api.interceptGetAll(httpCodes.SUCCESS, api.noConfigsResponse).as('api.GetAll')
    api8021x.interceptGetAll(httpCodes.SUCCESS, api8021x.allConfigsResponse).as('api8021x.GetAll')
    cy.goToPage('Wireless')
    cy.get('button').contains('Add New').click()
    cy.wait('@api8021x.GetAll')
  })

  const createdConfigs: wireless.Config[] = []
  formEntry.configs.forEach((config) => {
    it(`should create config ${config.profileName}`, () => {
      createdConfigs.push(config)
      api.interceptPost(httpCodes.CREATED, config).as('api.Post')
      const expectedRsp = { data: createdConfigs, totalCount: createdConfigs.length }
      api.interceptGetAll(httpCodes.SUCCESS, expectedRsp).as('api.GetAll')
      cy.enterWirelessInfo(config)
      cy.get('button[type=submit]').click()
      cy.wait('@api.Post').its('response.statusCode').should('eq', httpCodes.CREATED)
      cy.wait('@api.GetAll')
      cy.get('mat-cell').contains(config.profileName)
      cy.get('mat-cell').contains(wireless.AuthenticationMethods.labelForValue(config.authenticationMethod))
      cy.get('mat-cell').contains(wireless.EncryptionMethods.labelForValue(config.encryptionMethod))
    })
  })
})
