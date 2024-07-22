import { Component } from '@angular/core'
import { DevicesService } from '../devices.service'
import { MatToolbar } from '@angular/material/toolbar'
import { MatCard, MatCardModule } from '@angular/material/card'

@Component({
  selector: 'app-network-settings',
  standalone: true,
  imports: [MatToolbar, MatCardModule],
  templateUrl: './network-settings.component.html',
  styleUrl: './network-settings.component.scss'
})
export class NetworkSettingsComponent {
  constructor(public devices: DevicesService) {}
}
