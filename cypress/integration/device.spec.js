//Tests the creation of a profile
const loginFixtures = require("../fixtures/accounts.json");
const urlFixtures = require("../fixtures/urls.json");
const apiResponses = require("../fixtures/apiResponses.json");

//Default behavior (no input) is to stub responses
//and use the base url saved in the url fixture
const stubIt = Cypress.env("ISOLATED") != "n";
const baseUrl =
  Cypress.env("BASEURL") == "" ? urlFixtures.base : Cypress.env("BASEURL");

describe("Test Information", () => {
  it("display any important test info", () => {
    stubIt ? cy.log("stubbing") : cy.log("end to end");
  });
});

//---------------------------- Test section ----------------------------

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

      cy.intercept("GET", "devices", {
        statusCode: apiResponses.devices.getAll.empty.code,
        body: apiResponses.devices.getAll.empty.response,
      }).as("get-devices");
    } else {
      cy.intercept("POST", "authorize").as("login-request");
      cy.intercept("GET", "devices").as("get-devices");
    }

    //Login and navigate to profile page
    cy.visit(baseUrl);
    cy.login(loginFixtures.default.username, loginFixtures.default.password);
    cy.wait("@login-request").its("response.statusCode").should("eq", 200);

    cy.get(".mat-list-item").contains("Devices").click();
    cy.wait("@get-devices").its("response.statusCode").should("eq", 200);
  });

  context("test filtering funciton", () => {
    it("loads all the elements to be filtered", () => {
      if (stubIt) {
        cy.intercept("GET", "devices", {
          statusCode: apiResponses.devices.getAll.success.code,
          body: apiResponses.devices.getAll.success.response,
        }).as("get-devices");
      } else {
        cy.intercept("GET", "devices").as("get-devices");
      }

      cy.get(".mat-list-item").contains("Dashboard").click();
      cy.get(".mat-list-item").contains("Devices").click();
      cy.wait("@get-devices");
    });
  });
});
