/*********************************************************************
* Copyright (c) Intel Corporation 2022
* SPDX-License-Identifier: Apache-2.0
**********************************************************************/

import { httpCodes } from 'cypress/e2e/fixtures/api/httpCodes'
import * as apiProfile from 'cypress/e2e/fixtures/api/profile'
import * as formEntryProfile from 'cypress/e2e/fixtures/formEntry/profile'

describe('Test Profiles Deletion', () => {
  const allProfiles = [...formEntryProfile.profiles]
  let remainingConfigs = [...allProfiles]

  beforeEach(() => {
    cy.setup()
    apiProfile
      .interceptDelete(httpCodes.NO_CONTENT, null)
      .as('apiProfile.Delete')
  })

  it('should not delete when cancelled', () => {
    apiProfile
      .interceptGetAll(httpCodes.SUCCESS, { data: allProfiles, totalCount: allProfiles.length })
      .as('apiProfile.GetAll')
    cy.goToPage('Profiles')
    cy.wait('@apiProfile.GetAll')
    cy.get('mat-cell').contains('delete').click()
    cy.get('button').contains('No').click()
  })

  allProfiles.forEach((config) => {
    it(`should delete ${config.profileName}`, () => {
      apiProfile
        .interceptGetAll(httpCodes.SUCCESS, { data: [...remainingConfigs], totalCount: remainingConfigs.length })
        .as('apiProfile.GetAll')
      cy.goToPage('Profiles')
      cy.wait('@apiProfile.GetAll')
      remainingConfigs = remainingConfigs.filter(cfg => cfg.profileName !== config.profileName)
      apiProfile
        .interceptGetAll(httpCodes.SUCCESS, { data: [...remainingConfigs], totalCount: remainingConfigs.length })
        .as('apiProfile.GetAll')
      // Delete profile
      cy.get('mat-row').contains(config.profileName).parent().contains('delete').click()
      cy.get('button').contains('Yes').click()
      cy.wait('@apiProfile.GetAll')
    })
  })
})
