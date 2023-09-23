/*********************************************************************
* Copyright (c) Intel Corporation 2022
* SPDX-License-Identifier: Apache-2.0
**********************************************************************/

import { SelectionModel } from '@angular/cdk/collections'
import { Component, OnInit, ViewChild } from '@angular/core'
import { MatDialog } from '@angular/material/dialog'
import { MatPaginator, PageEvent } from '@angular/material/paginator'
import { MatSelectChange } from '@angular/material/select'
import { MatSnackBar } from '@angular/material/snack-bar'
import { Router } from '@angular/router'
import { catchError, delay, finalize, map, mergeMap } from 'rxjs/operators'
import { BehaviorSubject, forkJoin, from, Observable, of, throwError } from 'rxjs'
import { Device, DeviceResponse, PageEventOptions } from 'src/models/models'
import { AddDeviceComponent } from '../shared/add-device/add-device.component'
import SnackbarDefaults from '../shared/config/snackBarDefault'
import { DevicesService } from './devices.service'
import { AreYouSureDialogComponent } from '../shared/are-you-sure/are-you-sure.component'
import { DeviceEditTagsComponent } from './edit-tags/edit-tags.component'
import { caseInsensntiveCompare } from '../../utils'

@Component({
  selector: 'app-devices',
  templateUrl: './devices.component.html',
  styleUrls: ['./devices.component.scss']
})
export class DevicesComponent implements OnInit {
  public devices: DeviceResponse = { data: [], totalCount: 0 }
  public isLoading = true
  public tags: string[] = []
  public selectedTags = new BehaviorSubject<string[]>([])
  public selection: SelectionModel<Device>
  public bulkActionResponses: any[] = []
  public isTrue: boolean = false
  public powerStates: any

  displayedColumns: string[] = ['select', 'hostname', 'guid', 'status', 'tags', 'actions', 'notification']
  pageEvent: PageEventOptions = {
    pageSize: 25,
    startsFrom: 0,
    count: 'true'
  }

  @ViewChild(MatPaginator) paginator!: MatPaginator

  constructor (public snackBar: MatSnackBar, public dialog: MatDialog, public readonly router: Router, private readonly devicesService: DevicesService) {
    const initialSelection: Device[] = []
    const allowMultiSelect = true
    this.selection = new SelectionModel<any>(allowMultiSelect, initialSelection)
    this.powerStates = this.devicesService.PowerStates
  }

  ngOnInit (): void {
    this.getData(this.pageEvent)
  }

  getData (pageEvent: PageEventOptions): void {
    const tags = this.devicesService.getTags()
    forkJoin({ tags }).pipe(
      catchError((err) => {
        this.snackBar.open($localize`Error loading devices`, undefined, SnackbarDefaults.defaultError)
        return throwError(err)
      }), finalize(() => {
        this.isLoading = false
      })
    ).subscribe(data => {
      this.tags = data.tags
      // this.isLoading = false
    })

    this.selectedTags.pipe(
      mergeMap(tags => {
        this.isLoading = true
        return this.devicesService.getDevices({ ...pageEvent, tags })
      })
    ).subscribe(devices => {
      this.devices = devices
      const deviceIds = this.devices.data.filter(z => z.connectionStatus).map(x => x.guid)
      from(deviceIds).pipe(
        map(id => {
          return this.devicesService.getPowerState(id).pipe(map(result => {
            return { powerstate: result.powerstate, guid: id }
          }))
        })
      ).subscribe(results => {
        results.subscribe(x => {
          (devices.data.find(y => y.guid === x.guid) as any).powerstate = x.powerstate
        })
      })
      this.isLoading = false
    })
  }

  tagFilterChange (event: MatSelectChange): void {
    this.selectedTags.next(event.value)
  }

  bulkEditTags (): void {
    // use a copy of the selected devices tags (not all the tags available)
    const tagOccurencesMap = new Map<string, number>()
    this.selection.selected.forEach(device => {
      device.tags.forEach(tag => {
        let numOccurences = tagOccurencesMap.get(tag)
        if (numOccurences === undefined) {
          numOccurences = 0
        }
        tagOccurencesMap.set(tag, (numOccurences + 1))
      })
    })

    const originalTags: string[] = []
    const editedTags: string[] = []
    for (const [tag, numOccurences] of tagOccurencesMap) {
      if (numOccurences === this.selection.selected.length) {
        originalTags.push(tag)
        editedTags.push(tag)
      }
    }
    editedTags.sort(caseInsensntiveCompare)

    const dialogRef = this.dialog.open(DeviceEditTagsComponent, { data: editedTags })
    dialogRef.afterClosed().subscribe(tagsChanged => {
      if (tagsChanged) {
        // figure out which tags were added and/or removed
        const addedTags = editedTags.filter(t => !originalTags.includes(t))
        const removedTags = originalTags.filter(t => !editedTags.includes(t))

        const requests: Array<Observable<any>> = []
        this.isLoading = true
        this.selection.selected.forEach(device => {
          device.tags = device.tags.filter(t => !removedTags.includes(t))
          addedTags.forEach(t => { device.tags.push(t) })
          device.tags.sort(caseInsensntiveCompare)
          const req = this.devicesService
            .updateDevice(device)
            .pipe(
              catchError(err => of({ err }))
            )
          requests.push(req)
        })

        forkJoin(requests).subscribe(result => {
          this.isLoading = false
          result.forEach(res => {
            (this.devices.data.find(i => i.guid === res.guid) as any).StatusMessage = res.StatusMessage
          })
          this.resetResponse()
          this.getData(this.pageEvent)
        })
      }
    })
  }

  editTagsForDevice (deviceId: string): void {
    const device = this.devices.data.find(d => d.guid === deviceId) as Device
    // use a copy of the tags
    const editedTags = [...device.tags]
    const dialogRef = this.dialog.open(DeviceEditTagsComponent, { data: editedTags })
    dialogRef.afterClosed().subscribe(tagsChanged => {
      if (tagsChanged) {
        device.tags = editedTags.sort(caseInsensntiveCompare)
        this.devicesService
          .updateDevice(device)
          .subscribe(res => {
            this.getData(this.pageEvent)
          })
      }
    })
  }

  isAllSelected (): boolean {
    const numSelected = this.selection.selected.length
    const numRows = this.devices.data.length
    return numSelected === numRows
  }

  /** Selects all rows if they are not all selected; otherwise clear selection. */
  masterToggle (): void {
    this.isAllSelected()
      ? this.selection.clear()
      : this.devices.data.forEach(row => this.selection.select(row))
  }

  isNoData (): boolean {
    return !this.isLoading && this.devices.data.length === 0
  }

  async navigateTo (path: string): Promise<void> {
    await this.router.navigate([`/devices/${path}`])
  }

  translateConnectionStatus (status?: boolean): string {
    switch (status) {
      case false:
        return 'Disconnected'
      case true:
        return 'Connected'
      default:
        return 'Unknown'
    }
  }

  bulkPowerAction (action: number): void {
    const requests: Array<Observable<any>> = []
    this.isLoading = true
    this.selection.selected.forEach(z => {
      requests.push(this.devicesService.sendPowerAction(z.guid, action).pipe(
        catchError(err => of({ err })),
        map(i => ({
          StatusMessage: i?.Body && i.Body.ReturnValueStr ? i.Body.ReturnValueStr : 'ERROR',
          StatusType: i?.Body && i.Body.ReturnValue !== undefined ? i.Body.ReturnValue : -1,
          guid: z.guid
        }))
      ))
    })

    forkJoin(requests).subscribe(result => {
      this.isLoading = false
      result.forEach(res => {
        (this.devices.data.find(i => i.guid === res.guid) as any).StatusMessage = res.StatusMessage
      })
      this.resetResponse()
    })
  }

  sendPowerAction (deviceId: string, action: number): void {
    this.isLoading = true
    this.devicesService.sendPowerAction(deviceId, action).pipe(
      catchError((): any => {
        (this.devices.data.find(x => x.guid === deviceId) as any).StatusMessage = 'ERROR'
      }),
      finalize(() => {
        this.isLoading = false
      })
    ).subscribe(data => {
      (this.devices.data.find(x => x.guid === deviceId) as any).StatusMessage = data.Body.ReturnValueStr
      this.resetResponse()
      this.devicesService.getPowerState(deviceId).pipe(delay(2000)).subscribe(z => {
        (this.devices.data.find(y => y.guid === deviceId) as any).powerstate = z.powerstate
      })
    }, err => {
      console.error(err)
    })
  }

  sendDeactivate (deviceId: string): void {
    const dialogRef = this.dialog.open(AreYouSureDialogComponent)
    dialogRef.afterClosed().subscribe(result => {
      if (result === true) {
        this.isLoading = true
        this.devicesService.sendDeactivate(deviceId).pipe(
          finalize(() => {
            this.isLoading = false
          })
        ).subscribe({
          next: (data) => {
            (this.devices.data.find(x => x.guid === deviceId) as any).StatusMessage = data.status
            setTimeout(() => {
              this.getData(this.pageEvent)
            }, 3000)
          },
          error: (err) => {
            (this.devices.data.find(x => x.guid === deviceId) as any).StatusMessage = 'ERROR'
            console.error(err)
          }
        })
      }
    })
  }

  bulkDeactivate (): void {
    const dialogRef = this.dialog.open(AreYouSureDialogComponent)
    dialogRef.afterClosed().subscribe(result => {
      if (result === true) {
        const requests: Array<Observable<any>> = []
        this.isLoading = true
        this.selection.selected.forEach(z => {
          requests.push(this.devicesService.sendDeactivate(z.guid).pipe(
            catchError(err => of({ err })),
            map(i => ({
              StatusMessage: i?.status ? i.status : 'ERROR',
              guid: z.guid
            }))
          ))
        })
        forkJoin(requests).subscribe(result => {
          this.isLoading = false
          result.forEach(res => {
            (this.devices.data.find(i => i.guid === res.guid) as any).StatusMessage = res.StatusMessage
          })
          setTimeout(() => {
            this.getData(this.pageEvent)
          }, 3000)
        })
      }
    })
  }

  resetResponse (): void {
    setTimeout(() => {
      const found: any = this.devices.data.find((item: any) => item.StatusMessage === 'SUCCESS')
      if (found) {
        found.StatusMessage = ''
      }
    }, 5000)
  }

  addDevice (): void {
    this.dialog.open(AddDeviceComponent, {
      height: '500px',
      width: '600px'
    })
  }

  pageChanged (event: PageEvent): void {
    this.pageEvent = {
      ...this.pageEvent,
      pageSize: event.pageSize,
      startsFrom: event.pageIndex * event.pageSize
    }

    this.getData(this.pageEvent)
  }
}
