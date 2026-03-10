import { TestBed } from '@angular/core/testing';

import { RulesMetadataService } from './rules-metadata.service';

describe('RulesMetadataService', () => {
  let service: RulesMetadataService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(RulesMetadataService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
