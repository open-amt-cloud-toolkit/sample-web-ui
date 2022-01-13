describe('Successful execution of pre-provisioning on amtdevice', () => {
  it('Control Mode is pre-provisioning with AMT info ALL', () => {
    cy.exec('docker run --device=/dev/mei0 intel/oact-rpc-go:latest amtinfo', { failOnNonZeroExit: false }).then((result) => {
      cy.log(result.stderr)
      expect(result.stderr).to.contain('pre-provisioning state')
    })
  })

  it('Control Mode is pre-provisioning with Activate Device', () => {
    cy.exec('docker run --device=/dev/mei0 vprodemo.azurecr.io/rpc:latest --url wss://${FQDN}/activate -n -c "-t activate --profile ${profileName}"', { failOnNonZeroExit: false }).then((result) => {
      cy.log(result.stderr)
      expect(result.stderr).to.contain('pre-provisioning state')
    })
  })

  it('Control Mode is pre-provisioning with Deacivate Device', () => {
    cy.exec('docker run --device=/dev/mei0 vprodemo.azurecr.io/rpc:latest --url wss://${FQDN}/activate -v -n -c "deactivate -f --password ${{ secrets.AMT_PASSWORD }}', { failOnNonZeroExit: false }).then((result) => {
      cy.log(result.stderr)
      expect(result.stderr).to.contain('pre-provisioning state')
    })
  })

  it('Control Mode is pre-provisioning with Delete Profile', () => {
    cy.exec('cd ./sample-web-ui && npx cypress run --record --group delete-profile --spec "cypress/integration/profile/delete.*"', { failOnNonZeroExit: false }).then((result) => {
      cy.log(result.stderr)
      expect(result.stderr).to.contain('pre-provisioning state')
    })
  })

  it('Control Mode is pre-provisioning with Delete CIRA config', () => {
    cy.exec('cd ./sample-web-ui && npx cypress run --record --group delete-cira --spec "cypress/integration/cira/delete.*"', { failOnNonZeroExit: false }).then((result) => {
      cy.log(result.stderr)
      expect(result.stderr).to.contain('pre-provisioning state')
    })
  })
  
})