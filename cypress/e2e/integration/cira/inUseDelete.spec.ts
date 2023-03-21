/*********************************************************************
* Copyright (c) Intel Corporation 2022
* SPDX-License-Identifier: Apache-2.0
**********************************************************************/

import { httpCodes } from 'cypress/e2e/fixtures/api/httpCodes'
import * as apiCira from 'cypress/e2e/fixtures/api/cira'
import * as formEntryCira from 'cypress/e2e/fixtures/formEntry/cira'
import * as apiProfile from 'cypress/e2e/fixtures/api/profile'
import * as formEntryProfile from 'cypress/e2e/fixtures/formEntry/profile'
import * as apiWireless from 'cypress/e2e/fixtures/api/wireless'
import * as api8021x from 'cypress/e2e/fixtures/api/ieee8021x'

describe('Test CIRA Config Situations', () => {
  beforeEach('Clear cache and login', () => {
    cy.setup()
    apiCira.interceptGetAll(httpCodes.SUCCESS, apiCira.noConfigsResponse).as('apiCIRA.GetAll')
    apiCira.interceptCiraCert(httpCodes.SUCCESS, formEntryCira.MpsCertificate)
  })

  it('should create CIRA config, create AMT profile using the config and then delete the config', () => {
    // Fill out the config
    cy.goToPage('CIRA Configs')
    cy.wait('@apiCIRA.GetAll')
    cy.get('button').contains('Add New').click()

    const ciraConfig = { ...formEntryCira.configs[0] }
    apiCira.interceptPost(httpCodes.CREATED, ciraConfig).as('apiCIRA.Post')
    const expectedRsp = { data: [ciraConfig], totalCount: 1 }
    apiCira.interceptGetAll(httpCodes.SUCCESS, expectedRsp).as('apiCIRA.GetAll')
    cy.enterCiraInfo(ciraConfig)
    cy.get('button[type=submit]').click()
    cy.wait('@apiCIRA.Post').its('response.statusCode').should('eq', httpCodes.CREATED)
    cy.wait('@apiCIRA.GetAll').its('response.statusCode').should('eq', httpCodes.SUCCESS)

    // //Check that the config was successful
    cy.get('mat-cell').contains(ciraConfig.configName)

    // Fill out the profile
    apiWireless.interceptGetAll(httpCodes.SUCCESS, apiWireless.allConfigsResponse).as('apiWireless.GetAll')
    api8021x.interceptGetAll(httpCodes.SUCCESS, api8021x.allConfigsResponse).as('api8021x.GetAll')
    apiProfile.interceptGetAll(httpCodes.SUCCESS, { data: [], totalCount: 0 }).as('apiProfiles.GetAll')
    cy.goToPage('Profiles')
    cy.wait('@apiProfiles.GetAll')
    cy.get('button').contains('Add New').click()
    cy.wait('@apiCIRA.GetAll')
    cy.wait('@apiWireless.GetAll')
    cy.wait('@api8021x.GetAll')

    const amtProfile = { ...formEntryProfile.profiles[0] }
    amtProfile.profileName = 'CiraInUseTestProfile'
    amtProfile.ciraConfigName = ciraConfig.configName
    delete amtProfile.tlsMode
    delete amtProfile.tlsSigningAuthority
    delete amtProfile.ieee8021xProfileName
    amtProfile.wifiConfigs = []

    apiProfile.interceptPost(httpCodes.CREATED, amtProfile).as('apiProfiles.Post')
    apiProfile.interceptGetAll(httpCodes.SUCCESS, { data: [amtProfile], totalCount: 1 }).as('apiProfiles.GetAll')
    cy.enterProfileInfo(amtProfile)
    cy.get('button[type=submit]').click()
    cy.wait('@apiProfiles.Post').its('response.statusCode').should('eq', httpCodes.CREATED)
    cy.wait('@apiProfiles.GetAll')
    cy.get('mat-cell').contains(amtProfile.profileName)

    cy.goToPage('CIRA Configs')
    cy.wait('@apiCIRA.GetAll')

    apiCira.interceptDelete(
      httpCodes.BAD_REQUEST,
      {
        error: 'Foreign key violation',
        message: 'CIRA Config: happyPath associated with an AMT profile'
      }
    ).as('apiCira.Delete')

    cy.get('mat-row').contains(ciraConfig.configName).parent().contains('delete').click()
    cy.get('button').contains('Yes').click()
    cy.wait('@apiCira.Delete')

    // Check for snackbar text
    cy.get('simple-snack-bar').contains('associated with an AMT profile').should('exist')

    // Delete the profile
    cy.goToPage('Profiles')
    cy.wait('@apiProfiles.GetAll')
    cy.get('mat-row').contains(amtProfile.profileName).parent().contains('delete').click()
    cy.get('button').contains('Yes').click()

    cy.goToPage('CIRA Configs')
    cy.wait('@apiCIRA.GetAll')
    apiCira.interceptDelete(httpCodes.SUCCESS, { data: [], totalCount: 0 }).as('apiCira.Delete')
    cy.get('mat-row').contains(ciraConfig.configName).parent().contains('delete').click()
    cy.get('button').contains('Yes').click()
    cy.wait('@apiCira.Delete')
  })
})
