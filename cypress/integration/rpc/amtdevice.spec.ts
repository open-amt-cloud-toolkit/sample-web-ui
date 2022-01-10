describe('Successful execution of pre-provisioning on amtdevice', () => {
  it('Control Mode is pre-provisioning', () => {
    cy.exec('docker ps -a')
    .its('stdout')
    .should('contain','pre-provisioning state');
  });

});