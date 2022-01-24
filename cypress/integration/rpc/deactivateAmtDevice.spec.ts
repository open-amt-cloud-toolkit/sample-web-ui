describe('Deactivating AMT device', () => {
  it('Deacivate AMT device', { execTimeout: 90000 }, () => {
    cy.exec('docker run --device=/dev/mei0 vprodemo.azurecr.io/rpc-go:latest deactivate -u wss://cicdoact.eastus.azurecontainer.io:8443/activate -v -n -json --password P@ssw0rd', { failOnNonZeroExit: false }).then((result) => {
       expect(result.stderr).to.contain('Status: Deactivated')
    })
  })
})