import { TestBed } from '@angular/core/testing';

import { SecuritymasterService } from './securitymaster.service';

describe('SecuritymasterService', () => {
  let service: SecuritymasterService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SecuritymasterService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
