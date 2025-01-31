/*********************************************************************
 * Copyright (c) Intel Corporation 2022
 * SPDX-License-Identifier: Apache-2.0
 **********************************************************************/

import { Component, Input, AfterViewInit, ViewChild, inject, signal } from '@angular/core'
import { MatSnackBar } from '@angular/material/snack-bar'
import {
  MatTableDataSource,
  MatTable,
  MatColumnDef,
  MatHeaderCellDef,
  MatHeaderCell,
  MatCellDef,
  MatCell,
  MatHeaderRowDef,
  MatHeaderRow,
  MatRowDef,
  MatRow
} from '@angular/material/table'
import { of } from 'rxjs'
import { catchError, finalize } from 'rxjs/operators'
import SnackbarDefaults from 'src/app/shared/config/snackBarDefault'
import { EventLog, EventLogResponse } from 'src/models/models'
import { MomentModule } from 'ngx-moment'
import { MatCard, MatCardContent, MatCardHeader, MatCardTitle } from '@angular/material/card'
import { MatProgressBar } from '@angular/material/progress-bar'
import { environment } from 'src/environments/environment'
import { MatButtonModule } from '@angular/material/button'
import { DeviceLogService } from '../device-log.service'
import { MatPaginator, MatPaginatorModule, PageEvent } from '@angular/material/paginator'

type EventTypeMap = Record<number, string>
const EVENTTYPEMAP: EventTypeMap = {
  1: 'Threshold based event',
  7: 'Generic severity event',
  10: 'Linkup Event',
  111: 'Sensor specific event'
}

@Component({
  selector: 'app-event-log',
  templateUrl: './event-log.component.html',
  styleUrls: ['./event-log.component.scss'],
  imports: [
    MatProgressBar,
    MatCard,
    MatCardHeader,
    MatCardTitle,
    MatCardContent,
    MatTable,
    MatColumnDef,
    MatButtonModule,
    MatHeaderCellDef,
    MatHeaderCell,
    MatCellDef,
    MatCell,
    MatHeaderRowDef,
    MatHeaderRow,
    MatRowDef,
    MatRow,
    MomentModule,
    MatPaginatorModule
  ]
})
export class EventLogComponent implements AfterViewInit {
  snackBar = inject(MatSnackBar)
  private readonly deviceLogService = inject(DeviceLogService)

  @Input()
  public deviceId = ''

  @ViewChild(MatPaginator) paginator!: MatPaginator

  public isLoading = signal(true)
  public displayedColumns = [
    'Event',
    'Event Type',
    'timestamp'
  ]

  public eventLogData: EventLog[] = []
  public isCloudMode: boolean = environment.cloud
  public dataSource = new MatTableDataSource(this.eventLogData)
  public allEventLogs: EventLog[] = []
  public hasMoreRecords = false
  public pageSize = 120
  public currentPageIndex = 0
  public totalLength = 0

  constructor() {
    if (!this.isCloudMode) {
      this.displayedColumns = [
        'Event',
        'Source',
        'Severity',
        'timestamp'
      ]
    }
  }

  ngAfterViewInit(): void {
    if (this.isCloudMode) {
      this.isLoading.set(true)
      this.deviceLogService
        .getEventLog(this.deviceId)
        .pipe(
          catchError((err) => {
            console.error(err)
            this.snackBar.open($localize`Error retrieving event log`, undefined, SnackbarDefaults.defaultError)
            return of({ eventLogs: [], hasMoreRecords: true })
          }),
          finalize(() => {
            this.isLoading.set(false)
          })
        )
        .subscribe((data) => {
          this.eventLogData = data.eventLogs || []
          this.dataSource.data = this.eventLogData
        })
    } else {
      this.loadEventLogs(0)
    }
  }

  handlePageEvent(e: PageEvent): void {
    this.currentPageIndex = e.pageIndex
    const startIndex = e.pageIndex * this.pageSize

    if (startIndex + this.pageSize > this.allEventLogs.length && !this.hasMoreRecords) {
      this.loadEventLogs(startIndex)
    } else {
      this.updateDisplayData(e.pageIndex)
    }
  }

  loadEventLogs(startIndex: number): void {
    this.isLoading.set(true)
    this.deviceLogService
      .getEventLog(this.deviceId, startIndex, this.pageSize)
      .pipe(
        catchError((err) => {
          this.snackBar.open($localize`Error retrieving event log`, undefined, SnackbarDefaults.defaultError)
          return of({ eventLogs: [], hasMoreRecords: true })
        }),
        finalize(() => {
          this.isLoading.set(false)
        })
      )
      .subscribe((data) => {
        this.processEventLogsData(data, startIndex)
      })
  }

  processEventLogsData(data: EventLogResponse, startIndex: number): void {
    const newLogs = data.eventLogs || []
    this.allEventLogs = startIndex === 0 ? newLogs : [...this.allEventLogs, ...newLogs]
    this.hasMoreRecords = data.hasMoreRecords
    this.updateDisplayData(this.currentPageIndex)
    this.totalLength = this.allEventLogs.length
    if (!this.hasMoreRecords && newLogs.length === this.pageSize) {
      this.totalLength += this.pageSize
    }
  }

  updateDisplayData(pageIndex: number): void {
    const startIndex = pageIndex * this.pageSize
    const endIndex = startIndex + this.pageSize
    this.eventLogData = this.allEventLogs.slice(startIndex, endIndex)
    this.dataSource.data = this.eventLogData
  }

  decodeEventType(eventType: number): string {
    return EVENTTYPEMAP[eventType]
  }

  isNoData(): boolean {
    return this.isLoading() || this.eventLogData?.length === 0
  }
  download(): void {
    this.isLoading.set(true)
    this.deviceLogService.downloadEventLog(this.deviceId).subscribe((data) => {
      const blob = new Blob([data], { type: 'application/octet-stream' })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `event_${this.deviceId}.csv`
      a.click()

      window.URL.revokeObjectURL(url)
      this.isLoading.set(false)
    })
  }
}
