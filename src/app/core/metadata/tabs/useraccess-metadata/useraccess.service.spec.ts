import { TestBed } from '@angular/core/testing';

import { UseraccessService } from './useraccess.service';

describe('UseraccessService', () => {
  let service: UseraccessService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(UseraccessService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
