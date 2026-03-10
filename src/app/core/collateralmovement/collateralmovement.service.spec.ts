import { TestBed } from '@angular/core/testing';

import { CollateralmovementService } from './collateralmovement.service';

describe('CollateralmovementService', () => {
  let service: CollateralmovementService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CollateralmovementService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
