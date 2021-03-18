import { ComponentFixture, TestBed } from '@angular/core/testing'
import { SharedModule } from 'src/app/shared/shared.module'
import { DeviceToolbarComponent } from './device-toolbar.component'
import { ActivatedRoute } from '@angular/router'
import { of } from 'rxjs'
import { RouterTestingModule } from '@angular/router/testing'
import { DevicesService } from '../devices.service'

describe('DeviceToolbarComponent', () => {
  let component: DeviceToolbarComponent
  let fixture: ComponentFixture<DeviceToolbarComponent>
  let sendPowerActionSpy: jasmine.Spy

  beforeEach(async () => {
  const devicesService = jasmine.createSpyObj('DevicesService', ['sendPowerAction'])
  sendPowerActionSpy = devicesService.sendPowerAction.and.returnValue(of({}))
    await TestBed.configureTestingModule({
    imports: [SharedModule,  RouterTestingModule.withRoutes([])],
      declarations: [DeviceToolbarComponent],
      providers: [{ provide: DevicesService, useValue: devicesService }, {
        provide: ActivatedRoute,
        useValue: {
          params: of({ id: 'guid' })
        } }]
    })
      .compileComponents()
  })

  beforeEach(() => {
    fixture = TestBed.createComponent(DeviceToolbarComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
