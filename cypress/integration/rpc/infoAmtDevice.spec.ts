describe('Successful execution of pre-provisioning on amtdevice', () => {
  it('Control Mode is pre-provisioning with AMT info ALL', () => {
    cy.exec('docker run --device=/dev/mei0 intel/oact-rpc-go:latest amtinfo', { failOnNonZeroExit: false }).then((result) => {
      cy.log(result.stderr)
      expect(result.stderr).to.contain('pre-provisioning state')
    })
  })
})
