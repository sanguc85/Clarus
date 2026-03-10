import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CounterpartycollateralComponent } from './counterpartycollateral.component';

describe('CounterpartycollateralComponent', () => {
  let component: CounterpartycollateralComponent;
  let fixture: ComponentFixture<CounterpartycollateralComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CounterpartycollateralComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(CounterpartycollateralComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
