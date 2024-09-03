/*********************************************************************
 * Copyright (c) Intel Corporation 2022
 * SPDX-License-Identifier: Apache-2.0
 **********************************************************************/

import { HttpClient } from '@angular/common/http'
import { Injectable } from '@angular/core'
import { Observable, throwError } from 'rxjs'
import { catchError } from 'rxjs/operators'
import { environment } from 'src/environments/environment'
import { CIRAConfig, DataWithCount } from 'src/models/models'
import { AuthService } from '../auth.service'
import { PageEvent } from '@angular/material/paginator'

@Injectable({
  providedIn: 'root'
})
export class ConfigsService {
  private readonly url = `${environment.rpsServer}/api/v1/admin/ciraconfigs`

  constructor(
    private readonly authService: AuthService,
    private readonly http: HttpClient
  ) {}

  getData(pageEvent?: PageEvent): Observable<DataWithCount<CIRAConfig>> {
    let query = this.url
    if (pageEvent) {
      query += `?$top=${pageEvent.pageSize}&$skip=${pageEvent.pageIndex}&$count=true`
    } else {
      query += '?$count=true'
    }
    return this.http.get<DataWithCount<CIRAConfig>>(query).pipe(
      catchError((err) => {
        const errorMessages = this.authService.onError(err)
        return throwError(errorMessages)
      })
    )
  }

  getRecord(name: string): Observable<CIRAConfig> {
    return this.http.get<CIRAConfig>(`${this.url}/${encodeURIComponent(name)}`).pipe(
      catchError((err) => {
        const errorMessages = this.authService.onError(err)
        return throwError(errorMessages)
      })
    )
  }

  update(ciraConfig: CIRAConfig): Observable<CIRAConfig> {
    return this.http.patch<CIRAConfig>(this.url, ciraConfig).pipe(
      catchError((err) => {
        const errorMessages = this.authService.onError(err)
        return throwError(errorMessages)
      })
    )
  }

  create(ciraConfig: CIRAConfig): Observable<CIRAConfig> {
    return this.http.post<CIRAConfig>(this.url, ciraConfig).pipe(
      catchError((err) => {
        const errorMessages = this.authService.onError(err)
        return throwError(errorMessages)
      })
    )
  }

  loadMPSRootCert(): Observable<any> {
    // ToDo: Need to pass the mps server address to get the certs for each specific mps server
    const options = { responseType: 'text' } as any

    return this.http.get<string>(`${environment.mpsServer}/api/v1/ciracert`, options).pipe(
      catchError((err) => {
        const errorMessages: string[] = []
        errorMessages.push('Error loading CIRA config')
        return throwError(err)
      })
    )
  }

  delete(name: string): Observable<any> {
    return this.http.delete(`${this.url}/${encodeURIComponent(name)}`).pipe(
      catchError((err) => {
        const errorMessages = this.authService.onError(err)
        return throwError(errorMessages)
      })
    )
  }
}
