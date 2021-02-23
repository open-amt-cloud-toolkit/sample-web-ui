//Tests the creation of a cira-config

const loginFixtures = require("../../fixtures/accounts.json");
const systemFixtures = require("../../fixtures/system.json");
const urlFixtures = require("../../fixtures/urls.json");
const ciraFixtures = require("../../fixtures/cira.json");
const messageFixtures = require("../../fixtures/stubResponses/Cira/messages.json");

//Toggle switch for subbing the requests of going full stack
const stubIt = Cypress.env("RUN_E2E") == "true" ? false : true;

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
        body: "Request Stubbed!",
      }).as("login-request");

      cy.intercept("GET", "ciraconfigs", {
        statusCode: 404,
        body: messageFixtures.empty,
      }).as("get-configs");
    } else {
      cy.intercept("POST", "authorize").as("login-request");
      cy.intercept("GET", "ciraconfigs").as("get-configs");
    }

    //Login and Enter RPS
    cy.visit(urlFixtures.base);
    cy.login(loginFixtures.default.username, loginFixtures.default.password);
    cy.wait("@login-request").its("response.statusCode").should("eq", 200);
    cy.get(".rps-button").click();
    cy.url().should("include", urlFixtures.page.rps);

    //Navigate to CIRA config menu
    cy.get(".nav-item").contains("CIRA Configs").click();
    cy.wait("@get-configs").its("response.statusCode").should("eq", 404);
    cy.get(".btn-create").contains("New").click();
  });

  context("successful run", () => {
    it("creates the default CIRA config", () => {
      //Stub the get and post requests
      if (stubIt) {
        cy.intercept("POST", "create", {
          statusCode: 200,
          body: messageFixtures.default.insert.success,
        }).as("post-config");

        cy.intercept("GET", "ciraconfigs", {
          statusCode: 200,
          fixture: "stubResponses/Cira/one-default.json",
        }).as("get-configs");
      } else {
        cy.intercept("POST", "create").as("post-config");
        cy.intercept("GET", "ciraconfigs").as("get-configs");
      }

      //Fill out the config
      cy.get("[type=text]")
        .get("[name=configName]")
        .type(ciraFixtures.default.name);
      cy.contains(ciraFixtures.default.format).find("[type=radio]").click();
      cy.get("[type=text]")
        .get("[name=mpsServerAddress]")
        .type(systemFixtures.ip);
      cy.get("[type=text]").get("[name=mpsPort]").type(systemFixtures.mpsPort);
      cy.get("[type=text]")
        .get("[name=username]")
        .type(loginFixtures.default.username);
      cy.get("[type=text]")
        .get("[name=password]")
        .type(loginFixtures.default.password);
      cy.get("[type=text]").get("[name=commonName]").type(systemFixtures.ip);
      cy.get("[type=button]").contains("Load").click();
      cy.get("[type=submit]").contains("Create").click();

      //Wait for requests to finish and check them their responses
      cy.wait("@post-config").then((req) => {
        cy.wrap(req).its("response.statusCode").should("eq", 200);
        cy.wrap(req)
          .its("response.body")
          .should("eq", "CIRA Config default-test successfully inserted");
      });

      //TODO: check the response to make sure that it is correct
      //this is currently difficult because of the format of the response
      cy.wait("@get-configs").its("response.statusCode").should("eq", 200);
      cy.wait(100); //Bad style but necessary to let the page reload

      //Check that the config was successful
      cy.get("[col-id=configName]").contains(ciraFixtures.default.name);
      cy.get("[col-id=mpsServerAddress]").contains(systemFixtures.ip);
      cy.get("[col-id=username]").contains(loginFixtures.default.username);
    });

    //The delete test relies on the create test above.
    //This is bad style but these tests seems distict enough to
    //warrant haveing seperate tests. Consider fixing this style
    //issue if the tests become finicky or hard to understand
    it("deletes the default cira config", () => {
      //Stub the requests
      if (stubIt) {
        cy.intercept("DELETE", "ciraconfigs", {
          statusCode: 200,
          body: messageFixtures.default.delete.success,
        }).as("delete-config");

        cy.intercept("GET", "ciraconfigs", {
          statusCode: 404,
          body: messageFixtures.empty,
        }).as("get-configs");
      } else {
        cy.intercept("DELETE", "ciraconfigs").as("delete-config");
        cy.intercept("GET", "ciraconfigs").as("get-configs");
      }

      //Delete CIRA Config (but cancel)
      cy.get(".ag-cell")
        .contains(ciraFixtures.default.name)
        .parent()
        .find(".ag-selection-checkbox")
        .click();
      cy.get("[type=button").contains("Delete").click();
      cy.get("[data-icon=times]").get("[color=red]").click();

      //Check that the config was not deleted
      cy.get("[col-id=configName]").contains(ciraFixtures.default.name);
      cy.get("[col-id=mpsServerAddress]").contains(systemFixtures.ip);
      cy.get("[col-id=username]").contains(loginFixtures.default.username);

      //Delete CIRA Config
      cy.get("[type=button").contains("Delete").click();
      cy.get("[data-icon=check]").get("[color=green]").click();

      //Check that the config was deleted properly
      cy.contains("successfully deleted").should("exist");
      cy.get("[col-id=configName]")
        .contains(ciraFixtures.default.name)
        .should("not.exist");
    });
  });

  context("attempt to create an invalid config", () => {
    beforeEach("fills out the config", () => {
      cy.get(".btn-create").contains("New").click();

      //Fill out the config
      cy.get("[type=text]")
        .get("[name=configName]")
        .clear()
        .type(ciraFixtures.default.name);
      cy.contains(ciraFixtures.default.format).find("[type=radio]").click();
      cy.get("[type=text]")
        .get("[name=mpsServerAddress]")
        .clear()
        .type(systemFixtures.ip);
      cy.get("[type=text]").get("[name=mpsPort]").type(systemFixtures.mpsPort);
      cy.get("[type=text]")
        .get("[name=username]")
        .clear()
        .type(loginFixtures.default.username);
      cy.get("[type=text]")
        .get("[name=password]")
        .clear()
        .type(loginFixtures.default.password);
      cy.get("[type=text]")
        .get("[name=commonName]")
        .clear()
        .type(systemFixtures.ip);
    });

    it("enters an invalid config name", () => {
      //Edit config
      cy.get("[type=text]")
        .get("[name=configName]")
        .type(ciraFixtures.wrong.name);
      cy.get("[type=button]").contains("Load").click();

      //Check for proper fail state
      cy.get(".cira-error").should("be.visible");
      cy.get("[type=submit]")
        .contains("Create")
        .should("have.attr", "disabled");
    });

    it("accidently clicks FQDN", () => {
      //Edit config
      cy.contains("FQDN").find("[type=radio]").click();
      cy.get("[type=button]").contains("Load").click();

      //Check for proper fail state
      cy.get(".cira-error").should("be.visible");
      cy.get("[type=submit]")
        .contains("Create")
        .should("have.attr", "disabled");
    });
  });
});
