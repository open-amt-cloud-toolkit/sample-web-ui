//Tests the creation of a cira-config

const loginFixtures = require('../../fixtures/accounts.json')
const systemFixtures = require('../../fixtures/system.json')
const urlFixtures = require('../../fixtures/urls.json')
const ciraFixtures = require('../../fixtures/cira.json')

describe('Create and Delete the Tutorial CIRA Config', () => {
  before(() => {
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
    cy.get('.btn-create')
      .contains('New')
      .click()
  })

  after(() => {
    //Delete CIRA Config (but cancel)
    cy.get('.ag-cell')
      .contains(ciraFixtures.default.name)
      .parent()
      .find('.ag-selection-checkbox')
      .click()
    cy.get('[type=button')
      .contains('Delete')
      .click()
    cy.get('[data-icon=times]')
      .get('[color=red]')
      .click()

    //Delete CIRA Config
    cy.get('[type=button')
      .contains('Delete')
      .click()
    cy.get('[data-icon=check]')
      .get('[color=green]')
      .click()
  })

  it('creates the default CIRA config', () => {
    //Fill out the config
    cy.get('[type=text]')
      .get('[name=configName]')
      .type(ciraFixtures.default.name)
    cy.contains(ciraFixtures.default.format)
      .find('[type=radio]')
      .click()
    cy.get('[type=text]')
      .get('[name=mpsServerAddress]')
      .type(systemFixtures.ip)
    cy.get('[type=text]')
      .get('[name=mpsPort]')
      .type(systemFixtures.mpsPort)
    cy.get('[type=text]')
      .get('[name=username]')
      .type(loginFixtures.default.username)
    cy.get('[type=text]')
      .get('[name=password]')
      .type(loginFixtures.default.password)
    cy.get('[type=text]')
      .get('[name=commonName]')
      .type(systemFixtures.ip)
    cy.get('[type=button]')
      .contains('Load')
      .click()
    cy.get('[type=submit]')
      .contains('Create')
      .click()

    //bad style replace later  
    cy.wait(200)

    //Check that the config was successful
    cy.get('[col-id=configName]')
      .contains(ciraFixtures.default.name)
    cy.get('[col-id=mpsServerAddress]')
      .contains(systemFixtures.ip)
    cy.get('[col-id=username]')
      .contains(loginFixtures.default.username)
  })
})

describe('Create an Invalid CIRA Config', () => {
  before(() => {
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
  })

  beforeEach(() => {
    cy.get('.btn-create')
      .contains('New')
      .click()

    //Fill out the config
    cy.get('[type=text]')
      .get('[name=configName]')
      .type(ciraFixtures.default.name)
    cy.contains(ciraFixtures.default.format)
      .find('[type=radio]')
      .click()
    cy.get('[type=text]')
      .get('[name=mpsServerAddress]')
      .type(systemFixtures.ip)
    cy.get('[type=text]')
      .get('[name=mpsPort]')
      .type(systemFixtures.mpsPort)
    cy.get('[type=text]')
      .get('[name=username]')
      .type(loginFixtures.default.username)
    cy.get('[type=text]')
      .get('[name=password]')
      .type(loginFixtures.default.password)
    cy.get('[type=text]')
      .get('[name=commonName]')
      .type(systemFixtures.ip)
  })

  afterEach(() => {
    //Close window to prepare for next test
    cy.contains('Close')
      .click()
  })

  it('invalid config name', () => {
    //Edit config
    cy.get('[type=text]')
      .get('[name=configName]')
      .type(ciraFixtures.wrong.name)
    cy.get('[type=button]')
      .contains('Load')
      .click()

    //Check for proper fail state
    cy.get('.cira-error')
      .should('be.visible')
    cy.get('[type=submit]')
      .contains('Create')
      .should('have.attr', 'disabled')
  })

  it('accidently clicking FQDN', () => {
    //Edit config
    cy.contains('FQDN')
      .find('[type=radio]')
      .click()
    cy.get('[type=button]')
      .contains('Load')
      .click()

    //Check for proper fail state
    cy.get('.cira-error')
      .should('be.visible')
    cy.get('[type=submit]')
      .contains('Create')
      .should('have.attr', 'disabled')
  })
})