import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RulesgridComponent } from './rulesgrid.component';

describe('RulesgridComponent', () => {
  let component: RulesgridComponent;
  let fixture: ComponentFixture<RulesgridComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RulesgridComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RulesgridComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
