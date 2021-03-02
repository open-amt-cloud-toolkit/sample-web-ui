//A fake test for quickly accessing a specific point for manual testing
//Change any it to it.only then run to access that point

const loginFixtures = require('../fixtures/accounts.json')
const systemFixtures = require('../fixtures/system.json')
const urlFixtures = require('../fixtures/urls.json')


//Always succeeds
describe("Test Success", () => {
  it("succeeds", () => {
    cy.visit("https://www.google.com/")
    cy.log("success")
  })
});

// describe('Quick Access', () => {
//   it('prepares to create the default cira config', () => {

//     cy.window().then((win) => {
//       win.sessionStorage.clear();
//     });

//     cy.visit(urlFixtures.base);
//     cy.login(loginFixtures.default.username, loginFixtures.default.password);
//     cy.get(".mat-list-item").contains("CIRA Configs").click();

//     cy.pause()
//   })
// })