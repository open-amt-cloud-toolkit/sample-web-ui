//Tests the creation of a cira-config

const loginFixtures = require("../../fixtures/accounts.json");
const systemFixtures = require("../../fixtures/system.json");
const urlFixtures = require("../../fixtures/urls.json");
const ciraFixtures = require("../../fixtures/cira.json");
const messageFixtures = require("../../fixtures/stubResponses/Cira/messages.json");

describe("Test CIRA Config Page", () => {
  //This "it" acts as a before to circumvent the
  //lack of overriding interceptors issue. This
  //should be changed after cypress fixes the problem.
  it("before", () => {
    //Ensure user is logged out
    cy.window().then((win) => {
      win.sessionStorage.clear();
    });

    //Return an empty list for the CIRA configs
    cy.intercept("GET", "ciraconfigs", {
      statusCode: 404,
      body: messageFixtures.empty,
    }).as("get-configs");

    cy.intercept("POST", "authorize", {
      statusCode: 200,
      body: "Request Stubbed!",
    }).as("login-request");

    //Go to web page
    cy.visit(urlFixtures.base);

    //Login
    cy.get(".login-input")
      .get("[id=userName]")
      .type(loginFixtures.default.username);
    cy.get(".login-input")
      .get("[id=password]")
      .type(loginFixtures.default.password);
    cy.get(".login-btn").contains("Sign In").click();

    cy.wait("@login-request").its("response.statusCode").should("eq", 200);

    //Enter RPS
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
      cy.intercept("POST", "create", {
        statusCode: 200,
        body: messageFixtures.default.insert.success,
      }).as("post-config");

      cy.intercept("GET", "ciraconfigs", {
        statusCode: 200,
        fixture: "stubResponses/Cira/one-default.json",
      }).as("get-configs");

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

      cy.wait("@get-configs").its("response.statusCode").should("eq", 200);
      cy.wait(100); //Bad style but necessary to let the page reload

      //Check that the config was successful
      cy.get("[col-id=configName]").contains(ciraFixtures.default.name);
      cy.get("[col-id=mpsServerAddress]").contains(systemFixtures.ip);
      cy.get("[col-id=username]").contains(loginFixtures.default.username);
    });

    it("deletes the default cira config", () => {
      //Stub the requests
      cy.intercept("DELETE", "ciraconfigs", {
        statusCode: 200,
        body: messageFixtures.default.delete.success,
      }).as("delete-config");

      cy.intercept("GET", "ciraconfigs", {
        statusCode: 404,
        body: messageFixtures.empty,
      }).as("get-configs");

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
    it("fills out the config", () => {
      cy.get(".btn-create").contains("New").click();

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

      //Repair for next test
      cy.get("[type=text]")
        .get("[name=configName]")
        .type(ciraFixtures.default.name);
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

      //Repair for next test
      cy.contains(ciraFixtures.default.format).find("[type=radio]").click();
    });
  });
});
