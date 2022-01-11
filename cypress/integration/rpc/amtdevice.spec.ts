describe('Successful execution of pre-provisioning on amtdevice', () => {
  it('Control Mode is pre-provisioning', () => {
    cy.exec('docker run --device=/dev/mei0 intel/oact-rpc-go:latest  rpc amtinfo version',{failOnNonZeroExit: false})
    .its('stdout')
    .should('contain','pre-provisioning state');
  });
  

});