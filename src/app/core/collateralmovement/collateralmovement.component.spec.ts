import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CollateralmovementComponent } from './collateralmovement.component';

describe('CollateralmovementComponent', () => {
  let component: CollateralmovementComponent;
  let fixture: ComponentFixture<CollateralmovementComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CollateralmovementComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CollateralmovementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
