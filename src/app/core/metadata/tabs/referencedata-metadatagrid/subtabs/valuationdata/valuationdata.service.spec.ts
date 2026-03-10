import { TestBed } from '@angular/core/testing';

import { ValuationdataService } from './valuationdata.service';

describe('ValuationdataService', () => {
  let service: ValuationdataService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ValuationdataService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
