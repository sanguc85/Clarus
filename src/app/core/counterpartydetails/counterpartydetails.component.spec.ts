import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CounterpartydetailsComponent } from './counterpartydetails.component';

describe('CounterpartydetailsComponent', () => {
  let component: CounterpartydetailsComponent;
  let fixture: ComponentFixture<CounterpartydetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CounterpartydetailsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CounterpartydetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
