import { TestBed } from '@angular/core/testing';

import { DailymarginService } from './dailymargin.service';

describe('DailymarginService', () => {
  let service: DailymarginService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DailymarginService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
