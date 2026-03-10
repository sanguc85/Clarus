import { TestBed } from '@angular/core/testing';

import { DeliveryinstructionsService } from './deliveryinstructions.service';

describe('DeliveryinstructionsService', () => {
  let service: DeliveryinstructionsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DeliveryinstructionsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
