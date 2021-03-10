// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add("login", (email, password) => { ... })

//Login to the sample-web-ui
Cypress.Commands.add("login", (user, pass) => {
  if (user != "EMPTY") {
    cy.get("[name=userId]").type(user);
  }
  if (pass != "EMPTY") {
    cy.get("[name=Password]").type(pass);
  }
  cy.get("[id=btnLogin]").get("[type=submit]").click();
});

Cypress.Commands.add("enterCiraInfo", (name, ip, user, pass) => {
  cy.get("input").get("[name=configName]").type(name);
  cy.get("input").get("[name=mpsServerAddress]").type(ip);
  cy.get("input").get("[name=username]").type(user);
  cy.get("input").get("[name=password]").type(pass);
});

// -- This is a child command --
// Cypress.Commands.add("drag", { prevSubject: 'element'}, (subject, options) => { ... })

// -- This is a dual command --
// Cypress.Commands.add("dismiss", { prevSubject: 'optional'}, (subject, options) => { ... })

// -- This will overwrite an existing command --
// Cypress.Commands.overwrite("visit", (originalFn, url, options) => { ... })
