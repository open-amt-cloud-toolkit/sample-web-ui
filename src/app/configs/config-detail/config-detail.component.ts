/*********************************************************************
* Copyright (c) Intel Corporation 2021
* SPDX-License-Identifier: Apache-2.0
**********************************************************************/
import { Component, OnInit } from '@angular/core'
import { FormBuilder, FormGroup, Validators } from '@angular/forms'
import { MatSnackBar } from '@angular/material/snack-bar'
import { ActivatedRoute, Router } from '@angular/router'
import { throwError, Observable } from 'rxjs'

import { catchError, finalize, mergeMap } from 'rxjs/operators'
import SnackbarDefaults from 'src/app/shared/config/snackBarDefault'
import { CIRAConfig } from 'src/models/models'
import { ConfigsService } from '../configs.service'

@Component({
  selector: 'app-config-detail',
  templateUrl: './config-detail.component.html',
  styleUrls: ['./config-detail.component.scss']
})
export class ConfigDetailComponent implements OnInit {
  public configForm: FormGroup
  public isLoading = false
  public pageTitle = 'New CIRA Config'
  public isEdit = false
  constructor (public snackBar: MatSnackBar, public fb: FormBuilder, private readonly activeRoute: ActivatedRoute,
    public router: Router, public configsService: ConfigsService) {
    this.configForm = fb.group({
      configName: [null, Validators.required],
      mpsServerAddress: ['', Validators.required],
      serverAddressFormat: ['3', Validators.required], // 3 = ip, 201 = FQDN? wtf?
      commonName: [null, Validators.required],
      mpsPort: [4433, Validators.required],
      username: [null, Validators.required],
      password: [null, Validators.required],
      autoLoad: [true, Validators.required],
      mpsRootCertificate: [null],
      proxyDetails: [null]
      // authMethod:2
    })
  }
  // IP ADDRESS REGEX
  // ^(?!0)(?!.*\.$)((1?\d?\d|25[0-5]|2[0-4]\d)(\.|$)){4}$

  ngOnInit (): void {
    this.activeRoute.params.subscribe(params => {
      if (params.name != null && params.name !== '') {
        this.isLoading = true
        this.configsService.getRecord(params.name).pipe(
          catchError(err => {
            // TODO: handle error better
            console.log(err)
            this.snackBar.open($localize`Error loading CIRA config`, undefined, SnackbarDefaults.defaultError)
            return throwError(err)
          }), finalize(() => {
            this.isLoading = false
          })).subscribe(data => {
          this.isEdit = true
          this.pageTitle = data.configName
          this.configForm.controls.configName.disable()
          this.configForm.patchValue(data)
          this.configForm.patchValue({ serverAddressFormat: data.serverAddressFormat.toString() })
        })
      }
    })

    this.configForm.controls.serverAddressFormat?.valueChanges.subscribe(value => this.serverAddressFormatChange(+value))
    this.configForm.controls.autoLoad?.valueChanges.subscribe(value => this.autoLoadChange(value))
    this.configForm.controls.mpsServerAddress?.valueChanges.subscribe(value => this.serverAddressChange(value))
  }

  serverAddressChange (value: string): void {
    if (this.configForm.controls.serverAddressFormat?.value === '3') {
      this.configForm.controls.commonName?.setValue(value)
    }
  }

  async cancel (): Promise<void> {
    await this.router.navigate(['/ciraconfigs'])
  }

  autoLoadChange (value: boolean): void {
    if (value) {
      this.configForm.controls.mpsRootCertificate?.disable()
      this.configForm.controls.mpsRootCertificate?.clearValidators()
    } else {
      this.configForm.controls.mpsRootCertificate?.setValidators(Validators.required)
      this.configForm.controls.mpsRootCertificate?.enable()
    }
  }

  serverAddressFormatChange (value: number): void {
    if (value === 3) { // ipv4
      this.configForm.controls.commonName?.enable()
    } else { // fqdn
      this.configForm.controls.commonName?.disable()
      this.configForm.controls.commonName?.setValue(null)
    }
  }

  shouldShowCertBox (): boolean {
    return this.configForm.controls.autoLoad?.value === true
  }

  trimRootCert = (cert: string): string => cert.replace('-----BEGIN CERTIFICATE-----', '')
    .replace('-----END CERTIFICATE-----', '')
    .replace(/\s/g, '')

  onSubmit (): void {
    if (this.configForm.valid) {
      this.isLoading = true
      const result: any = Object.assign({}, this.configForm.getRawValue())
      // unsure why this is needed or what it is
      result.authMethod = 2
      // convert to number
      result.serverAddressFormat = +result.serverAddressFormat

      let rpsRequest: Observable<CIRAConfig>
      if (this.isEdit) {
        console.log(this.configForm.controls.configName)
        rpsRequest = this.configsService.update(result).pipe(catchError(err => {
          this.snackBar.open($localize`Error updating CIRA config`, undefined, SnackbarDefaults.defaultError)
          return throwError(err)
        }))
      } else {
        rpsRequest = this.configsService.create(result).pipe(catchError(err => {
          this.snackBar.open($localize`Error creating CIRA config`, undefined, SnackbarDefaults.defaultError)
          return throwError(err)
        }))
      }
      // todo: don't do it this way
      if (result.autoLoad) {
        delete result.autoLoad
        this.configsService.loadMPSRootCert().pipe(
          catchError(err => {
            this.snackBar.open($localize`Error loading MPS Root Cert`, undefined, SnackbarDefaults.defaultError)
            return throwError(err)
          }),
          finalize(() => {
            this.isLoading = false
          }),
          mergeMap(data => {
            result.mpsRootCertificate = this.trimRootCert(data)
            return rpsRequest
          })).subscribe(data => {
          this.snackBar.open($localize`CIRA config/updated created successfully`, undefined, SnackbarDefaults.defaultSuccess)
          // eslint-disable-next-line @typescript-eslint/no-floating-promises
          this.router.navigate(['/ciraconfigs'])
        }, err => {
          console.log(err)
        })
      } else {
        delete result.autoLoad
        rpsRequest.pipe(finalize(() => {
          this.isLoading = false
        })).subscribe(data => {
          this.snackBar.open($localize`CIRA config/updated created successfully`, undefined, SnackbarDefaults.defaultSuccess)
          // eslint-disable-next-line @typescript-eslint/no-floating-promises
          this.router.navigate(['/ciraconfigs'])
        }, err => {
          console.log(err)
        })
      }
    }
  }
}
