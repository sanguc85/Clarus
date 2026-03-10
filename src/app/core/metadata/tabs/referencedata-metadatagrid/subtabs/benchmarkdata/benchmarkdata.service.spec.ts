import { TestBed } from '@angular/core/testing';

import { BenchmarkdataService } from './benchmarkdata.service';

describe('BenchmarkdataService', () => {
  let service: BenchmarkdataService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(BenchmarkdataService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
