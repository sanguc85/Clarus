import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MonthlyinterestComponent } from './monthlyinterest.component';

describe('MonthlyinterestComponent', () => {
  let component: MonthlyinterestComponent;
  let fixture: ComponentFixture<MonthlyinterestComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MonthlyinterestComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MonthlyinterestComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
