/*********************************************************************
* Copyright (c) Intel Corporation 2022
* SPDX-License-Identifier: Apache-2.0
**********************************************************************/

import { httpCodes } from 'cypress/e2e/fixtures/api/httpCodes'
import * as api from 'cypress/e2e/fixtures/api/cira'
import * as formEntry from 'cypress/e2e/fixtures/formEntry/cira'
import * as cira from 'src/app/configs/configs.constants'

describe('Test CIRA Config Creation', () => {
  beforeEach('clear cache and login', () => {
    cy.setup()
    api.interceptGetAll(httpCodes.SUCCESS, api.noConfigsResponse).as('api.GetAll')
    api.interceptCiraCert(httpCodes.SUCCESS, formEntry.MpsCertificate)
    cy.goToPage('CIRA Configs')
    cy.get('button').contains('Add New').click()
  })

  const createdConfigs: cira.Config[] = []
  formEntry.configs.forEach((config) => {
    it(`should create config ${config.configName}`, () => {
      createdConfigs.push(config)
      api.interceptPost(httpCodes.CREATED, config).as('api.Post')
      const expectedRsp = { data: createdConfigs, totalCount: createdConfigs.length }
      api.interceptGetAll(httpCodes.SUCCESS, expectedRsp).as('api.GetAll')
      cy.enterCiraInfo(config)
      cy.get('button[type=submit]').click()
      cy.wait('@api.Post').its('response.statusCode').should('eq', httpCodes.CREATED)
      cy.wait('@api.GetAll')
      // TODO: select row and then check columns for correct info
      cy.get('mat-cell').contains(config.configName)
      cy.get('mat-cell').contains(config.mpsServerAddress)
      cy.get('mat-cell').contains(config.username)
    })
  })
})
