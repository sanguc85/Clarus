import { TestBed } from '@angular/core/testing';

import { MetadataMetadataService } from './metadata-metadata.service';

describe('MetadataMetadataService', () => {
  let service: MetadataMetadataService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MetadataMetadataService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
