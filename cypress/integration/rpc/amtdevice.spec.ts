describe('Successful execution of pre-provisioning on amtdevice', () => {
  it('Control Mode is pre-provisioning', () => {
    cy.exec('docker ls /dev/mei0')
    .its('stdout')
    .should('contain','pre-provisioning state');
  });
  

});