import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DailymarginComponent } from './dailymargin.component';

describe('DailymarginComponent', () => {
  let component: DailymarginComponent;
  let fixture: ComponentFixture<DailymarginComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DailymarginComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DailymarginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
