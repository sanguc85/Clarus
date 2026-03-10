import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MonthlyinterestgridComponent } from './monthlyinterestgrid.component';

describe('MonthlyinterestgridComponent', () => {
  let component: MonthlyinterestgridComponent;
  let fixture: ComponentFixture<MonthlyinterestgridComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MonthlyinterestgridComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MonthlyinterestgridComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
