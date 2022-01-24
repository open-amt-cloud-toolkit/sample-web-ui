describe('Activating AMT device', () => {
  it('Activating AMT device', { execTimeout: 240000 }, () => {
    cy.exec('docker run --device=/dev/mei0 intel/oact-rpc-go:latest activate -u wss://cicdoact.eastus.azurecontainer.io:8443/activate -v -n --profile happyPath', { failOnNonZeroExit: false }).then((result) => {      
      expect(result.stderr).to.contain('Status: Client control mode')
      expect(result.stderr).to.contain('Network: Ethernet Configured.')
      expect(result.stderr).to.contain('CIRA: Configured')
    })
  })
})