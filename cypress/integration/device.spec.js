//Tests the creation of a profile
const loginFixtures = require("../fixtures/accounts.json");
const urlFixtures = require("../fixtures/urls.json");
const apiResponses = require("../fixtures/apiResponses.json");

//If isolated is set to true then cypress will stub api requests
const stubIt = Cypress.env("ISOLATED");

describe("Test Device Page", () => {
  //This "it" acts as a before to circumvent the
  //lack of overriding interceptors issue. This
  //should be changed after cypress fixes the problem.
  it("before", () => {
    cy.window().then((win) => {
      win.sessionStorage.clear();
    });

    if (stubIt) {
      cy.intercept("POST", "authorize", {
        statusCode: apiResponses.login.success.code,
      }).as("login-request");

      cy.intercept("POST", /admin$/, {
        statusCode: 200,
        body: "[]",
      }).as("get-devices");
    } else {
      cy.intercept("POST", "authorize").as("login-request");
      cy.intercept("GET", /admin$/).as("get-devices");
    }

    //Login and navigate to profile page
    cy.visit(urlFixtures.base);
    cy.login(loginFixtures.default.username, loginFixtures.default.password);
    cy.wait("@login-request").its("response.statusCode").should("eq", 200);

    cy.get(".mat-list-item").contains("Devices").click();
    cy.wait("@get-devices").its("response.statusCode").should("eq", 200);
  });
});
