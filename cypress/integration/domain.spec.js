//https://open-amt-cloud-toolkit.github.io/docs/1.1/General/createProfileACM/

//Tests the creation of a profile
const loginFixtures = require("../fixtures/accounts.json");
const systemFixtures = require("../fixtures/system.json");
const urlFixtures = require("../fixtures/urls.json");
const domainFixtures = require("../fixtures/domain.json");
const messageFixtures = require("../fixtures/stubResponses/Cira/messages.json");

//If isolated is set to true then cypress will stub api requests
const stubIt = Cypress.env("ISOLATED");

describe("Test Profile Page", () => {
  //This "it" acts as a before to circumvent the
  //lack of overriding interceptors issue. This
  //should be changed after cypress fixes the problem.
  it("before", () => {
    cy.window().then((win) => {
      win.sessionStorage.clear();
    });

    if (stubIt) {
      cy.intercept("POST", "authorize", {
        statusCode: 200,
      }).as("login-request");

      cy.intercept("GET", "domains", {
        statusCode: 200,
        body: "[]",
      }).as("get-domains");
    } else {
      cy.intercept("POST", "authorize").as("login-request");
      cy.intercept("GET", "domains").as("get-domains");
    }

    //Login and navigate to profile page
    cy.visit(urlFixtures.base);
    cy.login(loginFixtures.default.username, loginFixtures.default.password);
    cy.wait("@login-request").its("response.statusCode").should("eq", 200);

    cy.get(".mat-list-item").contains("Domains").click();
    cy.wait("@get-domains").its("response.statusCode").should("eq", 200);
  });

  context("successful run", () => {
    it("creates the default domain", () => {
      //Stub the get and post requests
      if (stubIt) {
        cy.intercept("POST", "domains", {
          statusCode: 201,
          fixture: "stubResponses/Profile/post-success.json",
        }).as("post-profile");
      } else {
        cy.intercept("POST", "domains").as("post-domains");
      }

      //Fill out the profile
      cy.get("button").contains("Add New").click();
      cy.enterDomainInfo(
        domainFixtures.default.name,
        domainFixtures.default.domain
      );
    });
  });
});
