import { TestBed } from '@angular/core/testing';
import { CounterpartycollateralService } from './counterpartycollateral.service';

describe('CounterpartycollateralService', () => {
  let service: CounterpartycollateralService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CounterpartycollateralService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
