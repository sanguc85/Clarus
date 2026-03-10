import { TestBed } from '@angular/core/testing';

import { MonthlyinterestService } from './monthlyinterest.service';

describe('MonthlyinterestService', () => {
  let service: MonthlyinterestService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MonthlyinterestService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
