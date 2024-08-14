import { Component, Input, OnInit } from '@angular/core'
import { DevicesService } from '../devices.service'
import { MatCardModule } from '@angular/material/card'
import { catchError, finalize, throwError } from 'rxjs'
import { MatSnackBar } from '@angular/material/snack-bar'
import SnackbarDefaults from 'src/app/shared/config/snackBarDefault'
import { MatListModule } from '@angular/material/list'
import { MatIcon } from '@angular/material/icon'
import { MatDivider } from '@angular/material/divider'

@Component({
  selector: 'app-network-settings',
  standalone: true,
  imports: [
    MatCardModule,
    MatListModule,
    MatDivider,
    MatIcon
  ],
  templateUrl: './network-settings.component.html',
  styleUrl: './network-settings.component.scss'
})
export class NetworkSettingsComponent implements OnInit {
  @Input()
  public deviceId = ''
  isLoading = true
  public networkResults?: any

  constructor(
    public snackBar: MatSnackBar,
    public devicesService: DevicesService
  ) {}
  ngOnInit(): void {
    this.devicesService
      .getNetworkSettings(this.deviceId)
      .pipe(
        catchError((err) => {
          this.snackBar.open($localize`Error retrieving network settings`, undefined, SnackbarDefaults.defaultError)
          return throwError(err)
        }),
        finalize(() => {
          this.isLoading = false
        })
      )
      .subscribe((results) => {
        this.networkResults = results
      })
  }
}