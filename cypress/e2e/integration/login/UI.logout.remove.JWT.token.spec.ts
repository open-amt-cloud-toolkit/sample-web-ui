/*********************************************************************
* Copyright (c) Intel Corporation 2022
* SPDX-License-Identifier: Apache-2.0
**********************************************************************/

// Tests the login page with a multitude of fake accounts in
// different combinations of invalid login info.
// Also tests things like canceling a login and logging out after the login

const baseUrl: string = Cypress.env('BASEURL')
describe('Logging out of the UI should remove the JWT token from HTML5 Storage TC5375', () => {
  it('log in then log out', () => {
    cy.myIntercept('POST', 'authorize', {
      statusCode: 200,
      body: { token: '' }
    }).as('login-request')
    cy.setup().should(() => {
      const result = expect(localStorage.getItem('loggedInUser')).to.be.not.null
      console.log(result)
    })
    cy.url().should('eq', baseUrl)
    cy.contains('account_circle').click()
    cy.contains('Log out').click().should(() => {
      const result = expect(localStorage.getItem('loggedInUser')).to.be.null
      console.log(result)
    })
  })
})
