//Tests the login page with a multitude of fake accounts in
//different combinations of invalid login info.
//Also tests things like canceling a login and logging out after the login

const loginFixtures = require("../fixtures/accounts.json");
const urlFixtures = require("../fixtures/urls.json");

//Toggle switch for subbing the requests of going full stack
const stubIt = Cypress.env("RUN_E2E") == "true" ? false : true;

describe("Load Site", () => {
  it("loads the login page properly", () => {
    //Make sure the test always starts at the login page
    //and is never able to autologin
    cy.window().then((win) => {
      win.sessionStorage.clear();
    });

    //Go to base site
    cy.visit(urlFixtures.base);

    //Make sure the login page was hit
    cy.url().should("eq", urlFixtures.base + urlFixtures.page.login);
  });
});

describe("Test login page", () => {
  before("Load Site", () => {
    cy.window().then((win) => {
      win.sessionStorage.clear();
    });
    cy.visit(urlFixtures.base);
    cy.url().should("eq", urlFixtures.base + urlFixtures.page.login);
  });

  beforeEach("Clear inputs", () => {
    //Cannot simply clear inputs since the user's
    //login state cannot be guaranteed
    cy.window().then((win) => {
      win.sessionStorage.clear();
    });
    cy.reload();
  });

  context("Successful login", () => {
    it.only("logs in", () => {
      //Prepare to intercept login request
      if (stubIt) {
        cy.intercept("POST", "authorize", {
          statusCode: 200,
          body: "Request Stubbed!",
        }).as("login-request");
      } else {
        cy.intercept("POST", "authorize").as("login-request");
      }

      //Login
      cy.login(loginFixtures.default.username, loginFixtures.default.password);

      //Check that correct post request is made
      cy.wait("@login-request").then((req) => {
        cy.wrap(req).its("response.statusCode").should("eq", 200);
        cy.wrap(req)
          .its("request.body.username")
          .should("eq", loginFixtures.default.username);
        cy.wrap(req)
          .its("request.body.password")
          .should("eq", loginFixtures.default.password);
      });

      //Check that the login was successful
      cy.url().should("eq", urlFixtures.base + urlFixtures.page.landing);
    });
  });

  context("Failed login", () => {
    it("no username / valid password", () => {
      cy.login("EMPTY", loginFixtures.default.password);

      cy.get(".login-btn")
        .contains("Sign In")
        .parent()
        .should("have.attr", "disabled");
    });

    it("invalid username / valid password", () => {
      cy.login(loginFixtures.wrong.username, loginFixtures.default.password);

      cy.url().should("eq", urlFixtures.base + urlFixtures.page.login);
      cy.get(".error-message").should("be.visible");
    });

    it("valid username / no password", () => {
      cy.login(loginFixtures.default.username, "EMPTY");

      cy.get(".login-btn")
        .contains("Sign In")
        .parent()
        .should("have.attr", "disabled");
    });

    it("valid username / invalid password", () => {
      cy.login(loginFixtures.default.username, loginFixtures.wrong.password);

      cy.url().should("eq", urlFixtures.base + urlFixtures.page.login);
      cy.get(".error-message").should("be.visible");
    });

    it("no username / invalid password", () => {
      cy.login("EMPTY", loginFixtures.wrong.password);

      cy.get(".login-btn")
        .contains("Sign In")
        .parent()
        .should("have.attr", "disabled");
    });

    it("no username / no password", () => {
      cy.get(".login-btn")
        .contains("Sign In")
        .parent()
        .should("have.attr", "disabled");
    });
  });

  context("Canceled login", () => {
    it("cancels a valid login", () => {
      //Enter info and cancel
      //Can't use login function as it will sumbit login request
      cy.get(".login-input")
        .get("[id=userName]")
        .type(loginFixtures.default.username);
      cy.get(".login-input")
        .get("[id=password]")
        .type(loginFixtures.default.password);
      cy.get(".login-btn").contains("Cancel").click();

      //Check that the cancel was successful
      cy.url().should("eq", urlFixtures.base + urlFixtures.page.login);
      cy.get(".error-message").should("have.length", 2);
      cy.get(".login-btn")
        .contains("Sign In")
        .parent()
        .should("have.attr", "disabled");
    });

    it("cancels a partial login (username only)", () => {
      //Enter info and cancel
      cy.get(".login-input")
        .get("[id=userName]")
        .type(loginFixtures.default.username)
        .should("have.value", loginFixtures.default.username);
      cy.get(".login-btn").contains("Cancel").click();

      //Check that the cancel was successful
      cy.url().should("eq", urlFixtures.base + urlFixtures.page.login);
      cy.get(".error-message").should("have.length", 1);
      cy.get(".login-btn")
        .contains("Sign In")
        .parent()
        .should("have.attr", "disabled");
    });

    it("cancels a partial login (password only)", () => {
      //Enter info and cancel
      cy.get(".login-input")
        .get("[id=password]")
        .type(loginFixtures.default.password)
        .should("have.value", loginFixtures.default.password);
      cy.get(".login-btn").contains("Cancel").click();

      //Check that the cancel was successful
      cy.url().should("eq", urlFixtures.base + urlFixtures.page.login);
      cy.get(".error-message").should("have.length", 1);
      cy.get(".login-btn")
        .contains("Sign In")
        .parent()
        .should("have.attr", "disabled");
    });

    it("cancels an empty login", () => {
      cy.get(".login-btn").contains("Cancel").click();

      cy.get(".login-btn")
        .contains("Sign In")
        .parent()
        .should("have.attr", "disabled");
    });
  });

  context("Logout", () => {
    it("logs in then out", () => {
      //Prepare request intercepts
      if (stubIt) {
        cy.intercept("POST", "authorize", {
          statusCode: 200,
          body: "Request Stubbed!",
        }).as("login-request");

        cy.intercept("GET", "logout", {
          statusCode: 200,
        }).as("logout-request");
      } else {
        cy.intercept("POST", "authorize").as("login-request");
        cy.intercept("GET", "logout").as("logout-request");
      }

      //Login
      cy.login(loginFixtures.default.username, loginFixtures.default.password);
      cy.wait("@login-request");

      //Check that the login was successful
      cy.url().should("eq", urlFixtures.base + urlFixtures.page.landing);

      //Logout
      cy.get(".item-icon").get(".profile").click();
      cy.contains("Logout").click();

      //Check that the logout was successful
      cy.url().should("eq", urlFixtures.base + urlFixtures.page.login);
    });
  });
});
