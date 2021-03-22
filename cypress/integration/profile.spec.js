//Tests the creation of a profile
const loginFixtures = require("../fixtures/accounts.json");
const systemFixtures = require("../fixtures/system.json");
const urlFixtures = require("../fixtures/urls.json");
const ciraFixtures = require("../fixtures/cira.json");
const profileFixtures = require("../fixtures/profile.json");
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

      cy.intercept("GET", "profiles", {
        statusCode: 200,
        body: "[]",
      }).as("get-profiles");
    } else {
      cy.intercept("POST", "authorize").as("login-request");
      cy.intercept("GET", "profiles").as("get-profiles");
    }

    //Login and navigate to profile page
    cy.visit(urlFixtures.base);
    cy.login(loginFixtures.default.username, loginFixtures.default.password);
    cy.wait("@login-request").its("response.statusCode").should("eq", 200);

    cy.get(".mat-list-item").contains("Profiles").click();
    cy.wait("@get-profiles").its("response.statusCode").should("eq", 200);
  });

  context("successful run", () => {
    it("creates the default profile", () => {
      //Stub the get and post requests
      if (stubIt) {
        cy.intercept("GET", "ciraconfigs", {
          statusCode: 200,
          fixture: "stubResponses/Cira/one-default.json",
        }).as("get-configs");

        cy.intercept("POST", "profiles", {
          statusCode: 201,
          fixture: "stubResponses/Profile/post-success.json",
        }).as("post-profile");

        cy.intercept("GET", "profiles", {
          statusCode: 200,
          fixture: "stubResponses/Profile/one-default.json",
        }).as("get-profiles");
      } else {
        cy.intercept("GET", "ciraconfigs").as("get-configs");
        cy.intercept("POST", "profiles").as("post-profile");
        cy.intercept("GET", "profiles").as("get-profiles");
      }

      //Fill out the profile
      cy.get("button").contains("Add New").click();
      cy.enterProfileInfo(
        profileFixtures.default.name,
        profileFixtures.default.admin,
        profileFixtures.default.amtPassword,
        profileFixtures.default.mebxPassword,
        profileFixtures.default.netConfig,
        profileFixtures.default.ciraConfig
      );
      cy.get("button[type=submit]").click();

      //Wait for requests to finish and check them their responses
      cy.wait("@post-profile").then((req) => {
        cy.wrap(req).its("response.statusCode").should("eq", 201);
      });

      //TODO: check the response to make sure that it is correct
      //this is currently difficult because of the format of the response
      cy.wait("@get-profiles").its("response.statusCode").should("eq", 200);

      //Check that the config was successful
      cy.get("mat-cell").contains(profileFixtures.default.name);
      cy.get("mat-cell").contains(profileFixtures.check.network.dhcp);
      cy.get("mat-cell").contains(ciraFixtures.default.name);
      cy.get("mat-cell").contains(profileFixtures.check.mode.acm);
    });

    //The delete test relies on the create test above.
    //This is bad style but these tests seems distict enough to
    //warrant haveing seperate tests. Consider fixing this style
    //issue if the tests become finicky or hard to understand
    it("deletes the default profile", () => {
      //Stub the requests
      if (stubIt) {
        cy.intercept("DELETE", "profiles", {
          statusCode: 204,
        }).as("delete-profile");

        cy.intercept("GET", "profiles", {
          statusCode: 200,
          body: "[]",
        }).as("get-profiles");
      } else {
        cy.intercept("DELETE", "profiles").as("delete-profile");
        cy.intercept("GET", "profiles").as("get-profiles");
      }

      //Delete profile (but cancel)
      cy.get("mat-cell").contains("delete").click();
      cy.get("button").contains("No").click();

      //Check that the profile was not deleted
      cy.get("mat-cell").contains(profileFixtures.default.name);
      cy.get("mat-cell").contains(profileFixtures.check.network.dhcp);
      cy.get("mat-cell").contains(ciraFixtures.default.name);
      cy.get("mat-cell").contains(profileFixtures.check.mode.acm);

      //Delete profile
      cy.get("mat-cell").contains("delete").click();
      cy.get("button").contains("Yes").click();
      cy.wait("@delete-profile");

      //Check that the config was deleted properly
      cy.contains(profileFixtures.default.name).should("not.exist");
    });
  });

  context("failed runs", () => {
    afterEach("cancel the config", () => {
      cy.get("button").contains("CANCEL").click({ timeout: 50000 });
    });

    it("invalid profile name", () => {
      if (stubIt) {
        cy.intercept("GET", "ciraconfigs", {
          statusCode: 200,
          fixture: "stubResponses/Cira/one-default.json",
        }).as("get-configs");

        cy.intercept("POST", "profiles", {
          statusCode: 400,
          //Add fixture back if it becomes important
          // fixture: somthing.json,
        }).as("post-profile");
      } else {
        cy.intercept("GET", "ciraconfigs").as("get-configs");
        cy.intercept("POST", "profiles").as("post-profile");
      }

      cy.get("button").contains("Add New").click();
      cy.wait("@get-configs").its("response.statusCode").should("eq", 200);

      //Fill out the profile
      cy.enterProfileInfo(
        profileFixtures.wrong.name,
        profileFixtures.default.admin,
        profileFixtures.default.amtPassword,
        profileFixtures.default.mebxPassword,
        profileFixtures.default.netConfig,
        profileFixtures.default.ciraConfig
      );
      cy.get("button[type=submit]").click();

      //Wait for requests to finish and check them their responses
      cy.wait("@post-profile").then((req) => {
        cy.wrap(req).its("response.statusCode").should("eq", 400);
      });

      //Check that the profile creation failed
      cy.url().should(
        "eq",
        urlFixtures.base +
          urlFixtures.page.profiles +
          "/" +
          urlFixtures.extensions.creation
      );
    });

    it("invalid amt password", () => {
      if (stubIt) {
        cy.intercept("GET", "ciraconfigs", {
          statusCode: 200,
          fixture: "stubResponses/Cira/one-default.json",
        }).as("get-configs");

        cy.intercept("POST", "profiles", {
          statusCode: 400,
          //Add fixture back if it becomes important
          // fixture: somthing.json,
        }).as("post-profile");
      } else {
        cy.intercept("GET", "ciraconfigs").as("get-configs");
        cy.intercept("POST", "profiles").as("post-profile");
      }

      cy.get("button").contains("Add New").click();
      cy.wait("@get-configs").its("response.statusCode").should("eq", 200);

      //Fill out the profile
      cy.enterProfileInfo(
        profileFixtures.default.name,
        profileFixtures.default.admin,
        profileFixtures.wrong.amtPassword,
        profileFixtures.default.mebxPassword,
        profileFixtures.default.netConfig,
        profileFixtures.default.ciraConfig
      );
      cy.get("button[type=submit]").click();

      //Wait for requests to finish and check them their responses
      cy.wait("@post-profile").its("response.statusCode").should("eq", 400);

      //Check that the profile creation failed
      cy.url().should(
        "eq",
        urlFixtures.base +
          urlFixtures.page.profiles +
          "/" +
          urlFixtures.extensions.creation
      );
    });

    it("invalid mebx password", () => {
      if (stubIt) {
        cy.intercept("GET", "ciraconfigs", {
          statusCode: 200,
          fixture: "stubResponses/Cira/one-default.json",
        }).as("get-configs");

        cy.intercept("POST", "profiles", {
          statusCode: 400,
          //Add fixture back if it becomes important
          // fixture: somthing.json,
        }).as("post-profile");
      } else {
        cy.intercept("GET", "ciraconfigs").as("get-configs");
        cy.intercept("POST", "profiles").as("post-profile");
      }

      cy.get("button").contains("Add New").click();
      cy.wait("@get-configs").its("response.statusCode").should("eq", 200);

      //Fill out the profile
      cy.enterProfileInfo(
        profileFixtures.default.name,
        profileFixtures.default.admin,
        profileFixtures.default.amtPassword,
        profileFixtures.wrong.mebxPassword,
        profileFixtures.default.netConfig,
        profileFixtures.default.ciraConfig
      );
      cy.get("button[type=submit]").click();

      //Wait for requests to finish and check them their responses
      cy.wait("@post-profile").then((req) => {
        cy.wrap(req).its("response.statusCode").should("eq", 400);
      });

      //Check that the profile creation failed
      cy.url().should(
        "eq",
        urlFixtures.base +
          urlFixtures.page.profiles +
          "/" +
          urlFixtures.extensions.creation
      );
    });
  });
});
