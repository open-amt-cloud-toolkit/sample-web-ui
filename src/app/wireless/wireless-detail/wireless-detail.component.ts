/*********************************************************************
* Copyright (c) Intel Corporation 2022
* SPDX-License-Identifier: Apache-2.0
**********************************************************************/

import { Component, OnInit } from '@angular/core'
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms'
import { MatSnackBar } from '@angular/material/snack-bar'
import { ActivatedRoute, Router } from '@angular/router'
import { finalize } from 'rxjs/operators'
import SnackbarDefaults from 'src/app/shared/config/snackBarDefault'
import { WirelessService } from '../wireless.service'
import { IEEE8021xService } from '../../ieee8021x/ieee8021x.service'
import { AuthenticationMethods, Config, EncryptionMethods } from '../wireless.constants'
import { MatTooltip } from '@angular/material/tooltip'
import { MatIconButton, MatButton } from '@angular/material/button'
import { MatOption } from '@angular/material/core'
import { MatSelect } from '@angular/material/select'
import { MatInput } from '@angular/material/input'
import { MatFormField, MatLabel, MatError, MatHint, MatSuffix } from '@angular/material/form-field'
import { MatIcon } from '@angular/material/icon'
import { MatList, MatListItem } from '@angular/material/list'
import { MatCard, MatCardContent, MatCardActions } from '@angular/material/card'
import { MatToolbar } from '@angular/material/toolbar'
import { environment } from 'src/environments/environment'


@Component({
    selector: 'app-wireless-detail',
    templateUrl: './wireless-detail.component.html',
    styleUrls: ['./wireless-detail.component.scss'],
    standalone: true,
    imports: [MatToolbar, MatCard, MatList, MatListItem, MatIcon, ReactiveFormsModule, MatCardContent, MatFormField, MatLabel, MatInput, MatError, MatHint, MatSelect, MatOption, MatIconButton, MatSuffix, MatTooltip, MatCardActions, MatButton]
})
export class WirelessDetailComponent implements OnInit {
  public wirelessForm: FormGroup
  public pageTitle = 'New Wireless Config'
  public pskInputType = 'password'
  public pskMinLen = 8
  public pskMaxLen = 32
  public authenticationMethods = AuthenticationMethods.allExceptIEEE8021X()
  public encryptionModes = EncryptionMethods.all()
  public iee8021xConfigNames: Set<string> = new Set<string>()
  showPSKPassPhrase: boolean = false
  showIEEE8021x: boolean = false
  isLoading: boolean = true
  isEdit: boolean = false
  errorMessages: any[] = []
  cloudMode = environment.cloud

  constructor (
    public snackBar: MatSnackBar,
    public fb: FormBuilder,
    private readonly activeRoute: ActivatedRoute,
    public router: Router,
    public wirelessService: WirelessService,
    private readonly ieee8021xService: IEEE8021xService
  ) {
    this.wirelessForm = fb.group({
      profileName: [null, [Validators.required]],
      authenticationMethod: [null, Validators.required],
      encryptionMethod: [null, Validators.required],
      ssid: ['', Validators.required],
      pskPassphrase: [null, [Validators.minLength(this.pskMinLen), Validators.maxLength(this.pskMaxLen)]],
      ieee8021xProfileName: [null],
      version: [null]
    })
    this.wirelessForm.controls.authenticationMethod.valueChanges
      .subscribe((value: number) => { this.onAuthenticationMethodChange(value) })
  }

  ngOnInit (): void {
    this.getIEEE8021xConfigs()
    this.activeRoute.params.subscribe((params) => {
      if (params.name != null && params.name !== '') {
        this.wirelessService.getRecord(params.name as string)
          .pipe(
            finalize(() => {
              this.isLoading = false
            })
          )
          .subscribe((config) => {
            this.isEdit = true
            this.pageTitle = config.profileName
            this.wirelessForm.controls.profileName.disable()
            this.wirelessForm.patchValue(config)
            if (config.ieee8021xProfileName) {
              this.add8021xConfigurations([config.ieee8021xProfileName])
            }
          })
      }
    })
  }

  onSubmit (): void {
    if (this.wirelessForm.valid) {
      this.isLoading = true
      // adjust PSK and 8021x based on authentication method
      const value: number = this.wirelessForm.controls.authenticationMethod.value
      if (!AuthenticationMethods.isPSK(value)) {
        this.wirelessForm.controls.pskPassphrase.setValue(null)
      }
      if (!AuthenticationMethods.isIEEE8021X(value)) {
        this.wirelessForm.controls.ieee8021xProfileName.setValue(null)
      }
      const result: Config = Object.assign({}, this.wirelessForm.getRawValue())
      let request
      let reqType: string
      if (this.isEdit) {
        request = this.wirelessService.update(result)
        reqType = 'updated'
      } else {
        request = this.wirelessService.create(result)
        reqType = 'created'
      }
      request.pipe(
        finalize(() => {
          this.isLoading = false
        }))
        .subscribe({
          next: () => {
            this.snackBar.open(
              $localize`Profile ${reqType} successfully`,
              undefined,
              SnackbarDefaults.defaultSuccess)
            void this.router.navigate(['/wireless'])
          },
          error: error => {
            this.snackBar.open(
              $localize`Error creating/updating wireless profile`,
              undefined,
              SnackbarDefaults.defaultError)
              if (this.cloudMode === true) {
                this.errorMessages = error
                } else {
                this.errorMessages = []
                for (var err of error) {
                this.errorMessages.push(err.error.error) 
                }
                }
          }
        })
    }
  }

  getIEEE8021xConfigs (): void {
    this.ieee8021xService
      .getData()
      .subscribe({
        next: rsp => {
          const cfgNames = rsp.data.filter(c => !c.wiredInterface).map(c => c.profileName)
          if (cfgNames.length > 0) {
            this.add8021xConfigurations(cfgNames)
          }
        },
        error: error => {
          if (this.cloudMode === true) {
            this.errorMessages = error
            } else {
            this.errorMessages = []
            for (var err of error) {
            this.errorMessages.push(err.error.error) 
            }
            }
        }
      })
  }

  add8021xConfigurations (names: string[]): void {
    this.authenticationMethods = AuthenticationMethods.all()
    const sorted = [...this.iee8021xConfigNames, ...names].sort()
    this.iee8021xConfigNames = new Set(sorted)
  }

  onAuthenticationMethodChange (value: number): void {
    const controls = this.wirelessForm.controls
    if (AuthenticationMethods.isPSK(value)) {
      this.showPSKPassPhrase = true
      controls.pskPassphrase.addValidators(Validators.required)
    } else {
      this.showPSKPassPhrase = false
      controls.pskPassphrase.removeValidators(Validators.required)
    }
    controls.pskPassphrase.updateValueAndValidity()
    if (AuthenticationMethods.isIEEE8021X(value)) {
      this.showIEEE8021x = true
      controls.ieee8021xProfileName.addValidators(Validators.required)
    } else {
      this.showIEEE8021x = false
      controls.ieee8021xProfileName.removeValidators(Validators.required)
    }
    controls.ieee8021xProfileName.updateValueAndValidity()
  }

  togglePSKPassVisibility (): void {
    this.pskInputType = this.pskInputType === 'password' ? 'text' : 'password'
  }

  async cancel (): Promise<void> {
    await this.router.navigate(['/wireless'])
  }
}
