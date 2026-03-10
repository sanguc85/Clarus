import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DeliveryinstructionsComponent } from './deliveryinstructions.component';

describe('DeliveryinstructionsComponent', () => {
  let component: DeliveryinstructionsComponent;
  let fixture: ComponentFixture<DeliveryinstructionsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DeliveryinstructionsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DeliveryinstructionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
