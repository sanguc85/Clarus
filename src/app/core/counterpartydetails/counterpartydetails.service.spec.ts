import { TestBed } from '@angular/core/testing';

import { CounterpartydetailsService } from './counterpartydetails.service';

describe('CounterpartydetailsService', () => {
  let service: CounterpartydetailsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CounterpartydetailsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
