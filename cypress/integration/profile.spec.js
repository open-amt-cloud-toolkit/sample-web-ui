//Tests the creation of a cira-config

const loginFixtures = require("../fixtures/accounts.json");
const systemFixtures = require("../fixtures/system.json");
const urlFixtures = require("../fixtures/urls.json");
const ciraFixtures = require("../fixtures/cira.json");
const messageFixtures = require("../fixtures/stubResponses/Cira/messages.json");

//If isolated is set to true then cypress will stub api requests
const stubIt = Cypress.env("ISOLATED")

//Always succeeds
describe("Test Success", () => {
  it("succeeds", () => {
    cy.log("success")
  })
});

// describe("Test Profile Page", () => {
//   //This "it" acts as a before to circumvent the
//   //lack of overriding interceptors issue. This
//   //should be changed after cypress fixes the problem.
//   it("before", () => {
//     cy.window().then((win) => {
//       win.sessionStorage.clear();
//     });

//     if (stubIt) {
//       cy.intercept("POST", "authorize", {
//         statusCode: 200,
//       }).as("login-request");

//       cy.intercept("GET", "profile", {
//         statusCode: 404,
//         body: messageFixtures.empty,
//       }).as("get-configs");
//       cy.log("stubbed")
//     } else {
//       cy.intercept("POST", "authorize").as("login-request");
//       cy.intercept("GET", "profile").as("get-configs");
//       cy.log("e2e")
//     }

//     //Login and navigate to CIRA page
//     cy.visit(urlFixtures.base);
//     cy.login(loginFixtures.default.username, loginFixtures.default.password);
//     cy.wait("@login-request").its("response.statusCode").should("eq", 200);
    
//     cy.get(".mat-list-item").contains("Profiles").click();
//     cy.wait("@get-configs").its("response.statusCode").should("eq", 404);
//   });

//   context("successful run", () => {
//     it("creates the default CIRA config", () => {
//       //Stub the get and post requests
//       if (stubIt) {
//         cy.intercept("POST", "create", {
//           statusCode: 200,
//           body: messageFixtures.default.insert.success,
//         }).as("post-config");

//         cy.intercept("GET", "profiles", {
//           statusCode: 200,
//         }).as("get-configs");
//       } else {
//         cy.intercept("POST", "create").as("post-config");
//         cy.intercept("GET", "profiles").as("get-configs");
//       }

//       cy.get('button').contains('Add New').click()

//       //Fill out the config
//       cy.get('input')
//         .get('[name=profileName]')
//         .type(ciraFixtures.default.name);
//       cy.get('mat-select').get('[formcontrolname=activation]').click()
//       cy.get('mat-option').contains('Admin Control Mode').click()
//       cy.get('mat-checkbox').get('[formcontrolname=generateRandomPassword]').click()
//       cy.get('input')
//         .get('[name=passwordLength]')
//         .type('10');
//       cy.get('mat-checkbox').get('[formcontrolname=generateRandomMEBxPassword]').click()
//       cy.get('input')
//         .get('[name=mebxPasswordLength]')
//         .type('10');
//       cy.get('mat-radio-button[value=dhcp_enabled]').click()
//       //Add Cira config when that is working
//       cy.get("[type=submit]").contains("SAVE").click();

//       //Wait for requests to finish and check their responses
//       cy.wait("@post-config").then((req) => {
//         cy.wrap(req).its("response.statusCode").should("eq", 200);
//         cy.wrap(req)
//           .its("response.body")
//           .should("eq", "CIRA Config default-test successfully inserted");
//       });

//       //TODO: check the response to make sure that it is correct
//       //this is currently difficult because of the format of the response
//       cy.wait("@get-configs").its("response.statusCode").should("eq", 200);
//       cy.wait(100); //Bad style but necessary to let the page reload

//       // //Check that the config was successful
//       // cy.get("[col-id=configName]").contains(ciraFixtures.default.name);
//       // cy.get("[col-id=mpsServerAddress]").contains(systemFixtures.ip);
//       // cy.get("[col-id=username]").contains(loginFixtures.default.username);
//     });

//     // //The delete test relies on the create test above.
//     // //This is bad style but these tests seems distict enough to
//     // //warrant haveing seperate tests. Consider fixing this style
//     // //issue if the tests become finicky or hard to understand
//     // it("deletes the default cira config", () => {
//     //   //Stub the requests
//     //   if (stubIt) {
//     //     cy.intercept("DELETE", "ciraconfigs", {
//     //       statusCode: 200,
//     //       body: messageFixtures.default.delete.success,
//     //     }).as("delete-config");

//     //     cy.intercept("GET", "ciraconfigs", {
//     //       statusCode: 404,
//     //       body: messageFixtures.empty,
//     //     }).as("get-configs");
//     //   } else {
//     //     cy.intercept("DELETE", "ciraconfigs").as("delete-config");
//     //     cy.intercept("GET", "ciraconfigs").as("get-configs");
//     //   }

//     //   //Delete CIRA Config (but cancel)
//     //   cy.get(".ag-cell")
//     //     .contains(ciraFixtures.default.name)
//     //     .parent()
//     //     .find(".ag-selection-checkbox")
//     //     .click();
//     //   cy.get("[type=button").contains("Delete").click();
//     //   cy.get("[data-icon=times]").get("[color=red]").click();

//     //   //Check that the config was not deleted
//     //   cy.get("[col-id=configName]").contains(ciraFixtures.default.name);
//     //   cy.get("[col-id=mpsServerAddress]").contains(systemFixtures.ip);
//     //   cy.get("[col-id=username]").contains(loginFixtures.default.username);

//     //   //Delete CIRA Config
//     //   cy.get("[type=button").contains("Delete").click();
//     //   cy.get("[data-icon=check]").get("[color=green]").click();

//     //   //Check that the config was deleted properly
//     //   cy.contains("successfully deleted").should("exist");
//     //   cy.get("[col-id=configName]")
//     //     .contains(ciraFixtures.default.name)
//     //     .should("not.exist");
//     // });
//   });

//   // context("attempt to create an invalid config", () => {
//   //   before("fills out the config", () => {
//   //     cy.get(".btn-create").contains("New").click();
//   //   });

//   //   beforeEach("fills out the config", () => {
//   //     //Fill out the config
//   //     cy.get("[type=text]")
//   //       .get("[name=configName]")
//   //       .clear()
//   //       .type(ciraFixtures.default.name);
//   //     cy.contains(ciraFixtures.default.format).find("[type=radio]").click();
//   //     cy.get("[type=text]")
//   //       .get("[name=mpsServerAddress]")
//   //       .clear()
//   //       .type(systemFixtures.ip);
//   //     cy.get("[type=text]").get("[name=mpsPort]").type(systemFixtures.mpsPort);
//   //     cy.get("[type=text]")
//   //       .get("[name=username]")
//   //       .clear()
//   //       .type(loginFixtures.default.username);
//   //     cy.get("[type=text]")
//   //       .get("[name=password]")
//   //       .clear()
//   //       .type(loginFixtures.default.password);
//   //     cy.get("[type=text]")
//   //       .get("[name=commonName]")
//   //       .clear()
//   //       .type(systemFixtures.ip);
//   //   });

//   //   it("enters an invalid config name", () => {
//   //     //Edit config
//   //     cy.get("[type=text]")
//   //       .get("[name=configName]")
//   //       .type(ciraFixtures.wrong.name);
//   //     cy.get("[type=button]").contains("Load").click();

//   //     //Check for proper fail state
//   //     cy.get(".cira-error").should("be.visible");
//   //     cy.get("[type=submit]")
//   //       .contains("Create")
//   //       .should("have.attr", "disabled");
//   //   });

//   //   it("accidently clicks FQDN", () => {
//   //     //Edit config
//   //     cy.contains("FQDN").find("[type=radio]").click();
//   //     cy.get("[type=button]").contains("Load").click();

//   //     //Check for proper fail state
//   //     cy.get(".cira-error").should("be.visible");
//   //     cy.get("[type=submit]")
//   //       .contains("Create")
//   //       .should("have.attr", "disabled");
//   //   });
//   // });
// });
