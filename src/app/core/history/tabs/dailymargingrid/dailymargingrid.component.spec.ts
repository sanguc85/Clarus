import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DailymargingridComponent } from './dailymargingrid.component';

describe('DailymargingridComponent', () => {
  let component: DailymargingridComponent;
  let fixture: ComponentFixture<DailymargingridComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DailymargingridComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DailymargingridComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
