import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CounterpartygridComponent } from './counterpartygrid.component';

describe('CounterpartygridComponent', () => {
  let component: CounterpartygridComponent;
  let fixture: ComponentFixture<CounterpartygridComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CounterpartygridComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CounterpartygridComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
