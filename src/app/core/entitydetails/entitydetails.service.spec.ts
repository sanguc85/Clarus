import { TestBed } from '@angular/core/testing';

import { EntitydetailsService } from './entitydetails.service';

describe('EntitydetailsService', () => {
  let service: EntitydetailsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(EntitydetailsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
