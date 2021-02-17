//A fake test for quickly accessing a specific point for manual testing
//Change any it to it.only then run to access that point

const loginFixtures = require('../fixtures/accounts.json')
const systemFixtures = require('../fixtures/system.json')
const urlFixtures = require('../fixtures/urls.json')

describe('Quick Access', () => {
  it('prepares to create the default cira config', () => {

    //Ensure user is logged out
    cy.window().then((win) => {
      win.sessionStorage.clear()
    })

    //Go to web page
    cy.visit(urlFixtures.base)

    //Login
    cy.get('.login-input')
      .get('[id=userName]')
      .type(loginFixtures.default.username)
      .should('have.value', loginFixtures.default.username)
    cy.get('.login-input')
      .get('[id=password]')
      .type(loginFixtures.default.password)
      .should('have.value', loginFixtures.default.password)
    cy.get('.login-btn')
      .contains('Sign In')
      .click()

    //Enter RPS
    cy.get('.rps-button')
      .click()
    cy.url().should('include', urlFixtures.page.rps)

    //Navigate to CIRA config menu
    cy.get('.nav-item')
      .contains('CIRA Configs')
      .click()

    cy.pause()
  })
})