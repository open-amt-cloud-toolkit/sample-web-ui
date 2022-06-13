/*********************************************************************
* Copyright (c) Intel Corporation 2022
* SPDX-License-Identifier: Apache-2.0
**********************************************************************/

import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core'
import { PageEvent } from '@angular/material/paginator'
import { MatSnackBar } from '@angular/material/snack-bar'
import { MatSort } from '@angular/material/sort'
import { MatTableDataSource } from '@angular/material/table'
import { ActivatedRoute, Router } from '@angular/router'
import { BehaviorSubject, of } from 'rxjs'
import { catchError, finalize, switchMap } from 'rxjs/operators'
import SnackbarDefaults from 'src/app/shared/config/snackBarDefault'
import { AuditLogResponse, Device } from 'src/models/models'
import { DevicesService } from '../devices.service'

@Component({
  selector: 'app-audit-log',
  templateUrl: './audit-log.component.html',
  styleUrls: ['./audit-log.component.scss']
})
export class AuditLogComponent implements OnInit, AfterViewInit {
  public devices: Device[] = []
  public isLoading = true
  public deviceId: string = ''
  public displayedColumns = ['Event', 'timestamp']
  public auditLogData: AuditLogResponse = { totalCnt: 0, records: [] }
  public dataSource = new MatTableDataSource(this.auditLogData.records)
  public startIndex = new BehaviorSubject<number>(1)
  @ViewChild(MatSort, { static: true }) sort!: MatSort

  constructor (public snackBar: MatSnackBar,
    public readonly activatedRoute: ActivatedRoute,
    public readonly router: Router,
    private readonly devicesService: DevicesService) { }

  ngOnInit (): void {
    this.activatedRoute.params.subscribe(params => {
      this.isLoading = true
      this.deviceId = params.id
      this.startIndex.pipe(
        switchMap((val) => {
          this.isLoading = true
          return this.devicesService.getAuditLog(this.deviceId, val).pipe(
            catchError(err => {
            // TODO: handle error better
              console.log(err)
              this.snackBar.open($localize`Error retrieving audit log`, undefined, SnackbarDefaults.defaultError)
              return of(this.auditLogData)
            }), finalize(() => {
              this.isLoading = false
            })
          )
        })
      ).subscribe(data => {
        this.auditLogData = data
        this.dataSource.data = this.auditLogData.records
      })
    })
  }

  ngAfterViewInit (): void {
    this.dataSource.sort = this.sort
  }

  isNoData (): boolean {
    return !this.isLoading && this.auditLogData.records.length === 0
  }

  pageChange (event: PageEvent): void {
    this.startIndex.next(event.pageIndex * event.pageSize)
  }

  async navigateTo (path: string): Promise<void> {
    await this.router.navigate([`/devices/${path}`])
  }
}
