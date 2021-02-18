//Tests the login page with a multitude of fake accounts in
//different combinations of invalid login info.
//Also tests things like canceling a login and logging out after the login

const loginFixtures = require("../../fixtures/accounts.json");
const urlFixtures = require("../../fixtures/urls.json");

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

    //Attempting conditional stubbing
    // //stub login request
    // cy.intercept("POST", "authorize", (req) => {
    //   if (true) {
    //     req.body.username = "standalone";
    //   }
    // }).as("login-request");
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
    it("logs in", () => {
      //stub login request
      cy.intercept("POST", "authorize", {
        statusCode: 200,
        body: "Request Stubbed!",
      }).as("login-request");

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

      //Check that the site directs the user to the correct page
      cy.url().should("eq", urlFixtures.base + urlFixtures.page.landing);
    });
  });

  context("Failed logins - submitted", () => {
    Cypress.Commands.add("checkInvalidLogin", () => {
      //Check that correct post request is made
      cy.wait("@failed-login").then((req) => {
        cy.wrap(req).its("response.statusCode").should("eq", 403);
      });

      //Check that the site keeps the user on the login page
      cy.url().should("eq", urlFixtures.base + urlFixtures.page.login);
    });

    beforeEach(() => {
      //stub login request
      cy.intercept("POST", "authorize", {
        statusCode: 403,
        body: "Invalid username or password - Request Stubbed!",
      }).as("failed-login");
    });

    it("invalid username / valid password", () => {
      cy.login(loginFixtures.wrong.username, loginFixtures.default.password);
      cy.checkInvalidLogin();

      cy.url().should("eq", urlFixtures.base + urlFixtures.page.login);
      cy.get(".error-message").should("be.visible");
    });

    it("valid username / invalid password", () => {
      cy.login(loginFixtures.default.username, loginFixtures.wrong.password);
      cy.checkInvalidLogin();

      cy.url().should("eq", urlFixtures.base + urlFixtures.page.login);
      cy.get(".error-message").should("be.visible");
    });
  });

  context("Failed logins - incomplete", () => {
    it("no username / valid password", () => {
      cy.login("EMPTY", loginFixtures.default.password);

      cy.get(".login-btn")
        .contains("Sign In")
        .parent()
        .should("have.attr", "disabled");
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
    //No stubbing required so this section is the same
    //as the full stack version

    it("cancels a valid login", () => {
      //Enter info and cancel
      cy.get(".login-input")
        .get("[id=userName]")
        .type(loginFixtures.default.username)
        .should("have.value", loginFixtures.default.username);
      cy.get(".login-input")
        .get("[id=password]")
        .type(loginFixtures.default.password)
        .should("have.value", loginFixtures.default.password);
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
      // Request a login without adding login credencials
      //   cy.request({
      //     method: "POST",
      //     url: "https://192.168.50.40:3000/authorize",
      //     body: {
      //       username: loginFixtures.default.username,
      //       password: loginFixtures.default.password,
      //     },
      //   }).then((res) => {
      //     expect(res.statusCode).to.eq(200);
      //   });

      //Prepare intercepts
      cy.intercept("GET", "logout", {
        statusCode: 200,
      }).as("logout-request");

      cy.intercept("POST", "authorize", {
        statusCode: 200,
        body: "Request Stubbed!",
      }).as("login-request");

      //Login
      cy.login(loginFixtures.default.username, loginFixtures.default.password);

      //Check that the login was successful
      cy.wait("@login-request").its("response.statusCode").should("eq", 200);
      cy.url().should("eq", urlFixtures.base + urlFixtures.page.landing);

      // //Logout
      cy.get(".item-icon").get(".profile").click();
      cy.contains("Logout").click();

      //Check that the logout was successful
      cy.wait("@logout-request").its("response.statusCode").should("eq", 200);
      cy.url().should("eq", urlFixtures.base + urlFixtures.page.login);
    });
  });
});
