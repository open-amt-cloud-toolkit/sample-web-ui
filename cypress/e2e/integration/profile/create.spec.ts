/*********************************************************************
* Copyright (c) Intel Corporation 2022
* SPDX-License-Identifier: Apache-2.0
**********************************************************************/

import { httpCodes } from 'cypress/e2e/fixtures/api/httpCodes'
import * as apiProfile from 'cypress/e2e/fixtures/api/profile'
import * as apiWireless from 'cypress/e2e/fixtures/api/wireless'
import * as api8021x from 'cypress/e2e/fixtures/api/ieee8021x'
import * as apiCIRA from 'cypress/e2e/fixtures/api/cira'
import * as formEntryProfile from 'cypress/e2e/fixtures/formEntry/profile'
import * as profiles from 'src/app/profiles/profiles.constants'

describe('Test Profile Page', () => {
  beforeEach('clear cache and login', () => {
    cy.setup()
    apiCIRA.interceptGetAll(httpCodes.SUCCESS, apiCIRA.allConfigsResponse).as('apiCIRA.GetAll')
    apiWireless.interceptGetAll(httpCodes.SUCCESS, apiWireless.allConfigsResponse).as('apiWireless.GetAll')
    api8021x.interceptGetAll(httpCodes.SUCCESS, api8021x.allConfigsResponse).as('api8021x.GetAll')
    apiProfile.interceptGetAll(httpCodes.SUCCESS, apiProfile.noConfigsResponse).as('apiProfile.GetAll')
    cy.goToPage('Profiles')
    cy.get('button').contains('Add New').click()
    cy.wait('@apiCIRA.GetAll')
    cy.wait('@apiWireless.GetAll')
    cy.wait('@api8021x.GetAll')
  })

  const createdConfigs: profiles.Profile[] = []
  formEntryProfile.profiles.forEach((profile) => {
    it(`should create profile ${profile.profileName}`, () => {
      createdConfigs.push(profile)
      apiProfile.interceptPost(httpCodes.CREATED, profile).as('apiProfile.Post')
      const expectedRsp = { data: createdConfigs, totalCount: createdConfigs.length }
      apiProfile.interceptGetAll(httpCodes.SUCCESS, expectedRsp).as('apiProfile.GetAll')
      cy.enterProfileInfo(profile)
      cy.get('button[type=submit]').click()
      if (!profile.dhcpEnabled && profile.ciraConfigName) {
        // handle static CIRA warning
        cy.get('button').contains('Continue').click()
      }
      cy.wait('@apiProfile.Post').its('response.statusCode').should('eq', httpCodes.CREATED)
      cy.wait('@apiProfile.GetAll')
      cy.get('mat-cell').contains(profile.profileName)
      const activationLabel = profiles.ActivationModes.labelForValue(profile.activation)
      cy.get('mat-cell').contains(activationLabel)
    })
  })
})
