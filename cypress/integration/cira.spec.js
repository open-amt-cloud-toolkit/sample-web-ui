//Tests the creation of a cira-config

const loginFixtures = require("../fixtures/accounts.json");
const systemFixtures = require("../fixtures/system.json");
const urlFixtures = require("../fixtures/urls.json");
const ciraFixtures = require("../fixtures/cira.json");
const messageFixtures = require("../fixtures/stubResponses/Cira/messages.json");

//If isolated is set to true then cypress will stub api requests
const stubIt = Cypress.env("ISOLATED");

describe("Test CIRA Config Page", () => {
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

      cy.intercept("GET", "ciraconfigs", {
        statusCode: 200,
        body: "[]",
      }).as("get-configs");
    } else {
      cy.intercept("POST", "authorize").as("login-request");
      cy.intercept("GET", "ciraconfigs").as("get-configs");
    }

    //Login and navigate to CIRA page
    cy.visit(urlFixtures.base);
    cy.login(loginFixtures.default.username, loginFixtures.default.password);
    cy.wait("@login-request").its("response.statusCode").should("eq", 200);

    cy.get(".mat-list-item").contains("CIRA Configs").click();
    cy.wait("@get-configs").its("response.statusCode").should("eq", 200);
  });

  context("successful run", () => {
    it("creates the default CIRA config", () => {
      //Stub the get and post requests
      if (stubIt) {
        cy.intercept("POST", /admin$/, {
          statusCode: 200,
          body: messageFixtures.MpsCertificate,
        }).as("certificate");

        cy.intercept("POST", "ciraconfigs", {
          statusCode: 201,
          fixture: "stubResponses/Cira/post-success.json",
        }).as("post-config");

        cy.intercept("GET", "ciraconfigs", {
          statusCode: 200,
          fixture: "stubResponses/Cira/one-default.json",
        }).as("get-configs");
      } else {
        cy.intercept("POST", /admin$/).as("certificate");
        cy.intercept("POST", "ciraconfigs").as("post-config");
        cy.intercept("GET", "ciraconfigs").as("get-configs");
      }

      //Fill out the config
      cy.get("button").contains("Add New").click();
      cy.enterCiraInfo(
        ciraFixtures.default.name,
        systemFixtures.ip,
        loginFixtures.default.username,
        loginFixtures.default.password
      );
      cy.get("button[type=submit]").click();

      //Wait for requests to finish and check them their responses
      cy.wait("@post-config").then((req) => {
        cy.wrap(req).its("response.statusCode").should("eq", 201);
      });

      //TODO: check the response to make sure that it is correct
      //this is currently difficult because of the format of the response
      cy.wait("@get-configs").its("response.statusCode").should("eq", 200);

      // //Check that the config was successful
      cy.get("mat-cell").contains(ciraFixtures.default.name);
      cy.get("mat-cell").contains(systemFixtures.ip);
      cy.get("mat-cell").contains(loginFixtures.default.username);
    });

    //The delete test relies on the create test above.
    //This is bad style but these tests seems distict enough to
    //warrant haveing seperate tests. Consider fixing this style
    //issue if the tests become finicky or hard to understand
    it("deletes the default cira config", () => {
      //Stub the requests
      if (stubIt) {
        cy.intercept("DELETE", "ciraconfigs", {
          statusCode: 204,
        }).as("delete-config");

        cy.intercept("GET", "ciraconfigs", {
          statusCode: 200,
          body: messageFixtures.empty,
        }).as("get-configs");
      } else {
        cy.intercept("DELETE", "ciraconfigs").as("delete-config");
        cy.intercept("GET", "ciraconfigs").as("get-configs");
      }

      //Delete CIRA Config (but cancel)
      cy.get("mat-cell").contains("delete").click();
      cy.get("button").contains("No").click();

      //Check that the config was not deleted
      cy.get("mat-cell").contains(ciraFixtures.default.name);
      cy.get("mat-cell").contains(systemFixtures.ip);
      cy.get("mat-cell").contains(loginFixtures.default.username);

      //Delete CIRA Config
      cy.get("mat-cell").contains("delete").click();
      cy.get("button").contains("Yes").click();
      cy.wait("@delete-config");

      //Check that the config was deleted properly
      cy.contains(ciraFixtures.default.name).should("not.exist");
    });
  });

  context("attempt to create an invalid config", () => {
    beforeEach("fills out the config", () => {
      cy.get("button").contains("Add New").click();
    });

    afterEach("cancel the config", () => {
      cy.get("button").contains("CANCEL").click({ timeout: 50000 });
    });

    it("enters an invalid config name", () => {
      if (stubIt) {
        cy.intercept("POST", /admin$/, {
          statusCode: 200,
          body: messageFixtures.MpsCertificate,
        }).as("certificate");

        cy.intercept("POST", "ciraconfigs", {
          statusCode: 400,
          fixture: "stubResponses/Cira/post-invalid-name.json",
        }).as("post-config");

        cy.intercept("GET", "ciraconfigs", {
          statusCode: 200,
          body: "[]",
        }).as("get-configs");
      } else {
        cy.intercept("POST", /admin$/).as("certificate");
        cy.intercept("POST", "ciraconfigs").as("post-config");
        cy.intercept("GET", "ciraconfigs").as("get-configs");
      }

      cy.enterCiraInfo(
        ciraFixtures.wrong.name,
        systemFixtures.ip,
        loginFixtures.default.username,
        loginFixtures.default.password
      );
      cy.get("button[type=submit]").click({ timeout: 50000 });

      cy.wait("@post-config").its("response.statusCode").should("eq", 400);
    });

    it("enters an invalid username", () => {
      if (stubIt) {
        cy.intercept("POST", /admin$/, {
          statusCode: 200,
          body: messageFixtures.MpsCertificate,
        }).as("certificate");

        cy.intercept("POST", "ciraconfigs", {
          statusCode: 400,
          fixture: "stubResponses/Cira/post-invalid-name.json",
        }).as("post-config");

        cy.intercept("GET", "ciraconfigs", {
          statusCode: 200,
          body: "[]",
        }).as("get-configs");
      } else {
        cy.intercept("POST", /admin$/).as("certificate");
        cy.intercept("POST", "ciraconfigs").as("post-config");
        cy.intercept("GET", "ciraconfigs").as("get-configs");
      }

      cy.enterCiraInfo(
        ciraFixtures.default.name,
        systemFixtures.ip,
        ciraFixtures.wrong.username,
        loginFixtures.default.password
      );
      cy.get("button[type=submit]").click();

      cy.wait("@post-config").its("response.statusCode").should("eq", 400);
    });

    it("enters an invalid password", () => {
      if (stubIt) {
        cy.intercept("POST", /admin$/, {
          statusCode: 200,
          body: messageFixtures.MpsCertificate,
        }).as("certificate");

        cy.intercept("POST", "ciraconfigs", {
          statusCode: 400,
          fixture: "stubResponses/Cira/post-invalid-name.json",
        }).as("post-config");

        cy.intercept("GET", "ciraconfigs", {
          statusCode: 200,
          body: "[]",
        }).as("get-configs");
      } else {
        cy.intercept("POST", /admin$/).as("certificate");
        cy.intercept("POST", "ciraconfigs").as("post-config");
        cy.intercept("GET", "ciraconfigs").as("get-configs");
      }

      cy.enterCiraInfo(
        ciraFixtures.default.name,
        systemFixtures.ip,
        loginFixtures.default.username,
        ciraFixtures.wrong.password
      );
      cy.get("button[type=submit]").click();

      cy.wait("@post-config").its("response.statusCode").should("eq", 400);
    });
  });
});
