import { TestBed } from '@angular/core/testing';

import { SecuritypricesService } from './securityprices.service';

describe('SecuritypricesService', () => {
  let service: SecuritypricesService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SecuritypricesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
