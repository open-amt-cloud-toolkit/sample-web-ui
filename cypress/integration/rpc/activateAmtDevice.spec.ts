describe('Deacivating AMT device', () => {
  it('Deacivate AMT device', { execTimeout: 90000 }, () => {
    cy.exec('docker run --device=/dev/mei0 intel/oact-rpc-go:latest activate -u wss://cicdoact.eastus.azurecontainer.io:8443/activate -v -n --profile happyPath', { failOnNonZeroExit: false }).then((result) => {
      // cy.exec('docker run --device=/dev/mei0 intel/oact-rpc-go:latest version', { failOnNonZeroExit: false }).then((result) => {
      cy.log(result.stdout)
      console.log(result.stdout)
      expect(result.stderr).to.contain('pre-provisioning state')
    })
  })
})
