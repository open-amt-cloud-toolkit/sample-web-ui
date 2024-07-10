/*********************************************************************
* Copyright (c) Intel Corporation 2022
* SPDX-License-Identifier: Apache-2.0
**********************************************************************/

import { Component, OnInit } from '@angular/core'
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms'
import { MatSnackBar } from '@angular/material/snack-bar'
import { ActivatedRoute, Router } from '@angular/router'
import { Observable } from 'rxjs'

import { finalize, mergeMap } from 'rxjs/operators'
import SnackbarDefaults from 'src/app/shared/config/snackBarDefault'
import { CIRAConfig } from 'src/models/models'
import { ConfigsService } from '../configs.service'
import { MatButton } from '@angular/material/button'
import { MatSlideToggle } from '@angular/material/slide-toggle'
import { MatRadioGroup, MatRadioButton } from '@angular/material/radio'
import { MatInput } from '@angular/material/input'
import { MatFormField, MatError, MatHint } from '@angular/material/form-field'
import { MatIcon } from '@angular/material/icon'
import { MatList, MatListItem } from '@angular/material/list'
import { MatCard, MatCardHeader, MatCardTitle, MatCardSubtitle, MatCardContent, MatCardActions } from '@angular/material/card'
import { MatProgressBar } from '@angular/material/progress-bar'
import { MatToolbar } from '@angular/material/toolbar'
import { environment } from 'src/environments/environment'

@Component({
  selector: 'app-config-detail',
  templateUrl: './config-detail.component.html',
  styleUrls: ['./config-detail.component.scss'],
  standalone: true,
  imports: [MatToolbar, MatProgressBar, MatCard, MatCardHeader, MatCardTitle, MatCardSubtitle, MatList, MatListItem, MatIcon, ReactiveFormsModule, MatCardContent, MatFormField, MatInput, MatError, MatHint, MatRadioGroup, MatRadioButton, MatSlideToggle, MatCardActions, MatButton]
})
export class ConfigDetailComponent implements OnInit {
  public configForm: FormGroup
  public isLoading = false
  public pageTitle = 'New CIRA Config'
  public isEdit = false
  public errorMessages: string[] = []
  cloudMode = environment.cloud
  constructor(
    public snackBar: MatSnackBar,
    public fb: FormBuilder,
    private readonly activeRoute: ActivatedRoute,
    public router: Router,
    public configsService: ConfigsService
  ) {
    this.configForm = fb.group({
      configName: [null, Validators.required],
      mpsServerAddress: ['', Validators.required],
      serverAddressFormat: ['3', Validators.required], // 3 = ip, 201 = FQDN? wtf?
      commonName: [null, Validators.required],
      mpsPort: [4433, Validators.required],
      username: ['admin', Validators.required],
      mpsRootCertificate: [null],
      proxyDetails: [null],
      regeneratePassword: [false],
      version: [null]
    })
  }
  // IP ADDRESS REGEX
  // ^(?!0)(?!.*\.$)((1?\d?\d|25[0-5]|2[0-4]\d)(\.|$)){4}$

  ngOnInit(): void {
    this.activeRoute.params.subscribe((params) => {
      if (params.name) {
        this.isLoading = true
        this.configsService
          .getRecord(decodeURIComponent(params.name as string))
          .pipe(
            finalize(() => {
              this.isLoading = false
            })
          )
          .subscribe(
            (data) => {
              this.isEdit = true
              this.pageTitle = data.configName
              this.configForm.controls.configName.disable()
              this.configForm.patchValue(data)
              this.configForm.patchValue({
                serverAddressFormat: data.serverAddressFormat.toString()
              })
            },
            (error) => {
              if (this.cloudMode === true) {
                this.errorMessages = error
              } else {
                this.errorMessages = []
                for (var err of error) {
                  this.errorMessages.push(err.error.error)
                }
              }
            }
          )
      }
    })

    this.configForm.controls.serverAddressFormat?.valueChanges.subscribe(
      (value) => { this.serverAddressFormatChange(+value) }
    )

    this.configForm.controls.mpsServerAddress?.valueChanges.subscribe((value: string) => { this.serverAddressChange(value) }
    )
  }

  serverAddressChange(value: string): void {
    if (this.configForm.controls.serverAddressFormat?.value === '3') {
      this.configForm.controls.commonName?.setValue(value)
    }
  }

  async cancel(): Promise<void> {
    await this.router.navigate(['/ciraconfigs'])
  }

  serverAddressFormatChange(value: number): void {
    if (value === 3) {
      // ipv4
      this.configForm.controls.commonName?.enable()
    } else {
      // fqdn
      this.configForm.controls.commonName?.disable()
      this.configForm.controls.commonName?.setValue(null)
    }
  }

  shouldShowRegenPass(): boolean {
    return !this.isEdit
  }

  trimRootCert = (cert: string): string =>
    cert
      .replace('-----BEGIN CERTIFICATE-----', '')
      .replace('-----END CERTIFICATE-----', '')
      .replace(/\s/g, '')

  onSubmit(): void {
    if (this.configForm.valid) {
      this.isLoading = true
      const result: CIRAConfig = Object.assign({}, this.configForm.getRawValue())
      // unsure why this is needed or what it is
      result.authMethod = 2
      // convert to number
      result.serverAddressFormat = +result.serverAddressFormat
      let reqType: string
      let rpsRequest: Observable<CIRAConfig>
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
          mergeMap((data: string) => {
            result.mpsRootCertificate = this.trimRootCert(data)
            return rpsRequest
          })
        )
        .subscribe(
          (data) => {
            this.snackBar.open(
              $localize`CIRA ${reqType} created successfully`,
              undefined,
              SnackbarDefaults.defaultSuccess
            )
            // eslint-disable-next-line @typescript-eslint/no-floating-promises
            this.router.navigate(['/ciraconfigs'])
          },
          (error) => {
            if (this.cloudMode === true) {
              this.errorMessages = error
            } else {
              this.errorMessages = []
              for (var err of error) {
                this.errorMessages.push(err.error.error)
              }
            }
          }
        )
    }
  }
}
