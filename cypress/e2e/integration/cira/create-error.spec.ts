/*********************************************************************
* Copyright (c) Intel Corporation 2022
* SPDX-License-Identifier: Apache-2.0
**********************************************************************/

import { httpCodes } from 'cypress/e2e/fixtures/api/httpCodes'
import * as formEntry from 'cypress/e2e/fixtures/formEntry/cira'
import * as api from 'cypress/e2e/fixtures/api/cira'
import * as cira from 'src/app/configs/configs.constants'

describe('Test CIRA Config Creation Errors', () => {
  let config: cira.Config
  beforeEach('clear cache and login', () => {
    cy.setup()
    api.interceptGetAll(httpCodes.SUCCESS, api.noConfigsResponse).as('api.GetAll')
    api.interceptCiraCert(httpCodes.SUCCESS, formEntry.MpsCertificate).as('api.GetCiraCert')
    cy.goToPage('CIRA Configs')
    cy.get('button').contains('Add New').click()
    config = { ...formEntry.configs[0] }
  })

  it('Invalid Config Name', () => {
    config.configName = 'asdf -%^7'
    cy.enterCiraInfo(config)
    const errResponse = {
      error: 'Bad Request',
      message: 'CIRA profile name accepts letters, numbers and no spaces'
    }
    api.interceptPost(httpCodes.BAD_REQUEST, errResponse).as('api.Post')
    cy.get('button[type=submit]').click()
    cy.wait('@api.Post').its('response.statusCode').should('eq', httpCodes.BAD_REQUEST)
  })

  it('Invalid User Name', () => {
    config.username = 'no spaces or$^MB@LS'
    cy.enterCiraInfo(config)
    const errResponse = {
      error: 'Bad Request',
      message: 'CIRA profile name accepts letters, numbers and no spaces'
    }
    api.interceptPost(httpCodes.BAD_REQUEST, errResponse).as('api.Post')
    cy.get('button[type=submit]').click()
    cy.wait('@api.Post').its('response.statusCode').should('eq', httpCodes.BAD_REQUEST)
  })
})
