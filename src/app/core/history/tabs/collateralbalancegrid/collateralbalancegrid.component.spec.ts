import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CollateralbalancegridComponent } from './collateralbalancegrid.component';

describe('CollateralbalancegridComponent', () => {
  let component: CollateralbalancegridComponent;
  let fixture: ComponentFixture<CollateralbalancegridComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CollateralbalancegridComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CollateralbalancegridComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
