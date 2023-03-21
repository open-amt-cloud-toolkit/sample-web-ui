/*********************************************************************
* Copyright (c) Intel Corporation 2022
* SPDX-License-Identifier: Apache-2.0
**********************************************************************/

import { Component, OnInit } from '@angular/core'
import { FormBuilder, FormGroup, Validators } from '@angular/forms'
import { MatLegacySnackBar as MatSnackBar } from '@angular/material/legacy-snack-bar'
import { ActivatedRoute, Router } from '@angular/router'
import { Observable } from 'rxjs'

import { finalize, mergeMap } from 'rxjs/operators'
import SnackbarDefaults from 'src/app/shared/config/snackBarDefault'
import { ConfigsService } from '../configs.service'
import { AuthMethods, Config, ServerAddressFormats } from '../configs.constants'

@Component({
  selector: 'app-config-detail',
  templateUrl: './config-detail.component.html',
  styleUrls: ['./config-detail.component.scss']
})
export class ConfigDetailComponent implements OnInit {
  pageTitle = 'New CIRA Config'
  isLoading = false
  isEdit = false
  errorMessages: string[] = []
  configForm: FormGroup
  serverAdressFormats = ServerAddressFormats
  constructor (
    public snackBar: MatSnackBar,
    public fb: FormBuilder,
    private readonly activeRoute: ActivatedRoute,
    public router: Router,
    public configsService: ConfigsService
  ) {
    this.configForm = fb.group({
      configName: [null, Validators.required],
      mpsServerAddress: ['', Validators.required],
      serverAddressFormat: [ServerAddressFormats.IPv4.value, Validators.required],
      commonName: [null, Validators.required],
      mpsPort: [4433, Validators.required],
      username: ['admin', Validators.required],
      mpsRootCertificate: [null],
      proxyDetails: [null],
      regeneratePassword: [false],
      version: [null]
    })
    this.configForm.controls.serverAddressFormat.valueChanges
      .subscribe((value) => { this.serverAddressFormatChange(value) })
    this.configForm.controls.mpsServerAddress.valueChanges
      .subscribe((value) => { this.serverAddressChange(value) })
  }
  // IP ADDRESS REGEX
  // ^(?!0)(?!.*\.$)((1?\d?\d|25[0-5]|2[0-4]\d)(\.|$)){4}$

  ngOnInit (): void {
    this.activeRoute.params.subscribe((params) => {
      if (params.name != null && params.name !== '') {
        this.isLoading = true
        this.configsService
          .getRecord(params.name)
          .pipe(
            finalize(() => {
              this.isLoading = false
            })
          )
          .subscribe({
            next: (config) => {
              this.isEdit = true
              this.pageTitle = config.configName
              this.configForm.controls.configName.disable()
              this.configForm.patchValue(config)
            },
            error: (error) => {
              this.errorMessages = error
            }
          })
      }
    })
  }

  serverAddressChange (value: string): void {
    const controls = this.configForm.controls
    if (controls.serverAddressFormat.value === ServerAddressFormats.IPv4.value) {
      controls.commonName.setValue(value)
    }
  }

  async cancel (): Promise<void> {
    await this.router.navigate(['/ciraconfigs'])
  }

  // from the SDK -> CN (commonName)
  // A common name used when AccessInfo is an IP address.
  serverAddressFormatChange (value: number): void {
    const controls = this.configForm.controls
    if (value === ServerAddressFormats.IPv4.value) {
      controls.commonName.enable()
      controls.commonName.addValidators(Validators.required)
      controls.commonName.setValue(controls.mpsServerAddress.value)
    } else if (value === ServerAddressFormats.FQDN.value) {
      controls.commonName.disable()
      controls.commonName.setValue(null)
      controls.commonName.removeValidators(Validators.required)
    }
  }

  shouldShowRegenPass (): boolean {
    return !this.isEdit
  }

  trimRootCert = (cert: string): string =>
    cert
      .replace('-----BEGIN CERTIFICATE-----', '')
      .replace('-----END CERTIFICATE-----', '')
      .replace(/\s/g, '')

  onSubmit (): void {
    if (this.configForm.valid) {
      this.isLoading = true
      const result: any = Object.assign({}, this.configForm.getRawValue())
      // only USERNAME_PASSWORD is supported
      result.authMethod = AuthMethods.USERNAME_PASSWORD.value
      let reqType: string
      let rpsRequest: Observable<Config>
      if (this.isEdit) {
        reqType = 'updated'
        rpsRequest = this.configsService.update(result)
      } else {
        reqType = 'created'
        rpsRequest = this.configsService.create(result)
      }
      this.configsService
        .loadMPSRootCert()
        .pipe(
          finalize(() => {
            this.isLoading = false
          }),
          mergeMap((data) => {
            result.mpsRootCertificate = this.trimRootCert(data)
            return rpsRequest
          }))
        .subscribe({
          next: () => {
            this.snackBar.open(
              $localize`CIRA ${reqType} successfully`,
              undefined,
              SnackbarDefaults.defaultSuccess)
            void this.router.navigate(['/ciraconfigs'])
          },
          error: err => {
            this.snackBar.open(
              $localize`Error creating/updating configuraion`,
              undefined,
              SnackbarDefaults.defaultError)
            this.errorMessages = err
          }
        })
    }
  }
}
