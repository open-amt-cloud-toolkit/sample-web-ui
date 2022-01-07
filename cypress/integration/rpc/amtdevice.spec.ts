
describe('Successful execution of pre-provisioning on amtdevice', () => {
  it('Control Mode is pre-provisioning', () => {
    cy.exec('docker run --device=/dev/mei0 intel/oact-rpc-go:latest --amtinfo all')
    .its('stdout')
    .should('contain','pre-provisioning state');
  });
  

});

// docker run --device=/dev/mei0 vprodemo.azurecr.io/rpc:latest --amtinfo all