/*********************************************************************
 * Copyright (c) Intel Corporation 2022
 * SPDX-License-Identifier: Apache-2.0
 **********************************************************************/

import { AfterViewInit, Component, OnInit, signal, ViewChild } from '@angular/core'
import { MatDialog } from '@angular/material/dialog'
import { MatSnackBar } from '@angular/material/snack-bar'
import { Router } from '@angular/router'
import { finalize } from 'rxjs/operators'
import { AreYouSureDialogComponent } from '../shared/are-you-sure/are-you-sure.component'
import SnackbarDefaults from '../shared/config/snackBarDefault'
import { ProfilesService } from './profiles.service'
import { MatPaginator, PageEvent } from '@angular/material/paginator'
import { Profile, TlsModes } from './profiles.constants'
import {
  MatTable,
  MatColumnDef,
  MatHeaderCellDef,
  MatHeaderCell,
  MatCellDef,
  MatCell,
  MatHeaderRowDef,
  MatHeaderRow,
  MatRowDef,
  MatRow,
  MatTableDataSource
} from '@angular/material/table'
import { MatCard, MatCardContent } from '@angular/material/card'
import { MatProgressBar } from '@angular/material/progress-bar'
import { MatIcon } from '@angular/material/icon'
import { MatButton, MatIconButton } from '@angular/material/button'
import { MatToolbar } from '@angular/material/toolbar'
import { ToolkitPipe } from '../shared/pipes/toolkit.pipe'

@Component({
  selector: 'app-profiles',
  templateUrl: './profiles.component.html',
  styleUrls: ['./profiles.component.scss'],
  standalone: true,
  imports: [
    ToolkitPipe,
    MatToolbar,
    MatButton,
    MatIcon,
    MatProgressBar,
    MatCard,
    MatCardContent,
    MatTable,
    MatColumnDef,
    MatHeaderCellDef,
    MatHeaderCell,
    MatCellDef,
    MatCell,
    MatIconButton,
    MatHeaderRowDef,
    MatHeaderRow,
    MatRowDef,
    MatRow,
    MatPaginator
  ]
})
export class ProfilesComponent implements OnInit {
  profiles = new MatTableDataSource<Profile>([])
  isLoading = signal(true)
  totalCount = 0
  tlsModes = TlsModes
  displayedColumns: string[] = [
    'name',
    'networkConfig',
    'connectionConfig',
    'activation',
    'remove'
  ]
  pageEvent: PageEvent = {
    pageSize: 25,
    pageIndex: 0,
    length: 0
  }

  @ViewChild(MatPaginator) paginator!: MatPaginator

  constructor(
    public snackBar: MatSnackBar,
    public dialog: MatDialog,
    public readonly router: Router,
    private readonly profilesService: ProfilesService
  ) {}

  ngOnInit(): void {
    this.getData(this.pageEvent)
  }

  getData(pageEvent: PageEvent): void {
    this.profilesService
      .getData(pageEvent)
      .pipe(
        finalize(() => {
          this.isLoading.set(false)
        })
      )
      .subscribe({
        next: (rsp) => {
          this.profiles.data = rsp.data
          this.totalCount = rsp.totalCount
          this.paginator.length = rsp.totalCount
        },
        error: () => {
          this.snackBar.open($localize`Unable to load configurations`, undefined, SnackbarDefaults.defaultError)
        }
      })
  }

  isNoData(): boolean {
    return !this.isLoading() && this.profiles.data.length === 0
  }

  delete(name: string): void {
    const dialogRef = this.dialog.open(AreYouSureDialogComponent)

    dialogRef.afterClosed().subscribe((result) => {
      if (result === true) {
        this.isLoading.set(true)
        this.profilesService
          .delete(name)
          .pipe(
            finalize(() => {
              this.isLoading.set(false)
            })
          )
          .subscribe({
            next: () => {
              this.getData(this.pageEvent)
              this.snackBar.open($localize`Profile deleted successfully`, undefined, SnackbarDefaults.defaultSuccess)
            },
            error: (err) => {
              if (err?.length > 0) {
                this.snackBar.open(err as string, undefined, SnackbarDefaults.longError)
              } else {
                this.snackBar.open($localize`Unable to delete profile`, undefined, SnackbarDefaults.defaultError)
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
      pageIndex: event.pageIndex * event.pageSize
    }
    this.getData(this.pageEvent)
  }

  async navigateTo(path = 'new'): Promise<void> {
    await this.router.navigate(['/profiles', encodeURIComponent(path)])
  }
}
