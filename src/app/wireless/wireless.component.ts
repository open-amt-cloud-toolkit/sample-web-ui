/*********************************************************************
* Copyright (c) Intel Corporation 2022
* SPDX-License-Identifier: Apache-2.0
**********************************************************************/

import { Component, OnInit, ViewChild } from '@angular/core'
import { MatDialog } from '@angular/material/dialog'
import { MatSnackBar } from '@angular/material/snack-bar'
import { Router } from '@angular/router'
import { finalize } from 'rxjs/operators'
import { PageEventOptions } from 'src/models/models'
import { AreYouSureDialogComponent } from '../shared/are-you-sure/are-you-sure.component'
import SnackbarDefaults from '../shared/config/snackBarDefault'
import { WirelessService } from './wireless.service'
import { MatPaginator, PageEvent } from '@angular/material/paginator'
import { AuthenticationMethods, Config, EncryptionMethods } from './wireless.constants'
import { MatTable, MatColumnDef, MatHeaderCellDef, MatHeaderCell, MatCellDef, MatCell, MatHeaderRowDef, MatHeaderRow, MatRowDef, MatRow } from '@angular/material/table'
import { MatCard, MatCardContent } from '@angular/material/card'
import { MatProgressBar } from '@angular/material/progress-bar'
import { MatIcon } from '@angular/material/icon'
import { MatButton, MatIconButton } from '@angular/material/button'
import { MatToolbar } from '@angular/material/toolbar'
import { environment } from 'src/environments/environment'

@Component({
  selector: 'app-wireless',
  templateUrl: './wireless.component.html',
  styleUrls: ['./wireless.component.scss'],
  standalone: true,
  imports: [MatToolbar, MatButton, MatIcon, MatProgressBar, MatCard, MatCardContent, MatTable, MatColumnDef, MatHeaderCellDef, MatHeaderCell, MatCellDef, MatCell, MatIconButton, MatHeaderRowDef, MatHeaderRow, MatRowDef, MatRow, MatPaginator]
})
export class WirelessComponent implements OnInit {
  configs: Config[] = []
  isLoading = true
  totalCount: number = 0
  displayedColumns: string[] = ['name', 'authmethod', 'encryptionMethod', 'ssid', 'remove']
  authenticationMethods = AuthenticationMethods
  encryptionMethods = EncryptionMethods
  cloudMode = environment.cloud
  pageEvent: PageEventOptions = {
    pageSize: 25,
    startsFrom: 0,
    count: 'true'
  }

  @ViewChild(MatPaginator) paginator!: MatPaginator

  constructor(public snackBar: MatSnackBar, public readonly wirelessService: WirelessService, public router: Router, public dialog: MatDialog) { }

  ngOnInit(): void {
    this.getData(this.pageEvent)
  }

  getData(pageEvent: PageEventOptions): void {
    this.wirelessService
      .getData(pageEvent)
      .pipe(
        finalize(() => {
          this.isLoading = false
        })
      )
      .subscribe({
        next: (rsp) => {
          this.configs = rsp.data
          this.totalCount = rsp.totalCount
        },
        error: () => {
          this.snackBar.open($localize`Unable to load configurations`, undefined, SnackbarDefaults.defaultError)
        }
      })
  }

  isNoData(): boolean {
    return !this.isLoading && this.configs.length === 0
  }

  delete(name: string): void {
    const dialogRef = this.dialog.open(AreYouSureDialogComponent)

    dialogRef.afterClosed().subscribe(result => {
      if (result === true) {
        this.isLoading = true
        this.wirelessService
          .delete(name)
          .pipe(
            finalize(() => {
              this.isLoading = false
            })
          )
          .subscribe({
            next: data => {
              this.getData(this.pageEvent)
              this.snackBar.open($localize`Configuration deleted successfully`, undefined, SnackbarDefaults.defaultSuccess)
            },
            error: err => {
              var errorMessages: string[]
              if (this.cloudMode === true) {
                errorMessages = err
              } else {
                errorMessages = []
                for (var error of err) {
                  errorMessages.push(error.error.error)
                }
              }

              if (errorMessages?.length > 0) {
                this.snackBar.open(errorMessages[0], undefined, SnackbarDefaults.longError)
              } else {
                this.snackBar.open($localize`Unable to delete configuration`, undefined, SnackbarDefaults.defaultError)
              }
            }
          })
      }
    })
  }

  pageChanged(event: PageEvent): void {
    this.pageEvent = {
      ...this.pageEvent,
      pageSize: event.pageSize,
      startsFrom: event.pageIndex * event.pageSize
    }
    this.getData(this.pageEvent)
  }

  async navigateTo(path: string = 'new'): Promise<void> {
    await this.router.navigate([`/wireless/${path}`])
  }
}
