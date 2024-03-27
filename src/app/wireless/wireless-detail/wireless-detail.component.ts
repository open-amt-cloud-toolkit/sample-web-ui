/*********************************************************************
* Copyright (c) Intel Corporation 2022
* SPDX-License-Identifier: Apache-2.0
**********************************************************************/

import { Component, OnInit } from '@angular/core'
import { FormBuilder, FormGroup, Validators } from '@angular/forms'
import { MatSnackBar } from '@angular/material/snack-bar'
import { ActivatedRoute, Router } from '@angular/router'
import { finalize, tap } from 'rxjs/operators'
import SnackbarDefaults from 'src/app/shared/config/snackBarDefault'
import { WirelessService } from '../wireless.service'
import { IEEE8021xService } from '../../ieee8021x/ieee8021x.service'
import { AuthenticationMethodHelpers, AuthenticationMethods, Config, EncryptionMethods } from '../wireless.constants'
import { Observable } from 'rxjs'
import { DataWithCount } from 'src/models/models'
import { Config as IEEE8021xConfig } from '../../ieee8021x/ieee8021x.constants'

@Component({
  selector: 'app-wireless-detail',
  templateUrl: './wireless-detail.component.html',
  styleUrls: ['./wireless-detail.component.scss']
})
export class WirelessDetailComponent implements OnInit {
  public wirelessForm: FormGroup
  public pageTitle = 'New Wireless Config'
  public pskInputType = 'password'
  public pskMinLen = 8
  public pskMaxLen = 32
  public authenticationMethods = AuthenticationMethods
  public encryptionModes = EncryptionMethods
  public iee8021xConfigNames: string[] = []
  showPSKPassPhrase: boolean = false
  showIEEE8021x: boolean = false
  isLoading: boolean = true
  isEdit: boolean = false
  errorMessages: any[] = []

  constructor (public snackBar: MatSnackBar, public fb: FormBuilder, private readonly activeRoute: ActivatedRoute, public router: Router, public wirelessService: WirelessService, private readonly ieee8021xService: IEEE8021xService) {
    this.wirelessForm = fb.group({
      profileName: [null, [Validators.required]],
      authenticationMethod: [null, Validators.required],
      encryptionMethod: [null, Validators.required],
      ssid: ['', Validators.required],
      pskPassphrase: [null, [Validators.minLength(this.pskMinLen), Validators.maxLength(this.pskMaxLen)]],
      ieee8021xProfileName: [null],
      version: [null]
    })
    this.wirelessForm.controls.authenticationMethod.valueChanges.subscribe((value: number) => {
      this.onAuthenticationMethodChange(value)
    })
  }

  ngOnInit (): void {
    this.getIEEE8021xConfigs().subscribe(() => {
    this.activeRoute.params.subscribe((params) => {
        if (params.name != null && params.name !== '') {
          this.isEdit = true
          this.wirelessService.getRecord(params.name as string)
            .pipe(
              finalize(() => {
                this.isLoading = false
              })
            )
            .subscribe((config) => {
              this.pageTitle = config.profileName
              this.wirelessForm.controls.profileName.disable()
              this.wirelessForm.patchValue(config)
            })
        }
      })
    })
  }

  onSubmit (): void {
    if (this.wirelessForm.valid) {
      this.isLoading = true
      // adjust PSK and 8021x based on authentication method
      const value: number = this.wirelessForm.controls.authenticationMethod.value
      if (!AuthenticationMethodHelpers.isPSK(value)) {
        this.wirelessForm.controls.pskPassphrase.setValue(null)
      }
      if (!AuthenticationMethodHelpers.isIEEE8021X(value)) {
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
            this.snackBar.open($localize`Profile ${reqType} successfully`, undefined, SnackbarDefaults.defaultSuccess)
            void this.router.navigate(['/wireless'])
          },
          error: err => {
            this.snackBar.open($localize`Error creating/updating wireless profile`, undefined, SnackbarDefaults.defaultError)
            this.errorMessages = err
          }
        })
    }
  }

  getIEEE8021xConfigs (): Observable<DataWithCount<IEEE8021xConfig>> {
    return this.ieee8021xService.getData().pipe(tap({
        next: rsp => {
          const cfgNames: string[] = rsp.data.filter(c => !c.wiredInterface).map(c => c.profileName) ?? []
          this.iee8021xConfigNames = cfgNames.sort()
        },
        error: err => {
          this.errorMessages = err
        }
      }))
  }

  onAuthenticationMethodChange (value: number): void {
    const controls = this.wirelessForm.controls
    if (AuthenticationMethodHelpers.isPSK(value)) {
      this.showPSKPassPhrase = true
      controls.pskPassphrase.addValidators(Validators.required)
    } else {
      this.showPSKPassPhrase = false
      controls.pskPassphrase.removeValidators(Validators.required)
    }
    controls.pskPassphrase.updateValueAndValidity()
    if (AuthenticationMethodHelpers.isIEEE8021X(value)) {
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
