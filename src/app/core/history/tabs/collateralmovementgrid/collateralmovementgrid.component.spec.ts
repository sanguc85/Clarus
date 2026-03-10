import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CollateralmovementgridComponent } from './collateralmovementgrid.component';

describe('CollateralmovementgridComponent', () => {
  let component: CollateralmovementgridComponent;
  let fixture: ComponentFixture<CollateralmovementgridComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CollateralmovementgridComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CollateralmovementgridComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
