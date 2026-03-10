import { TestBed } from '@angular/core/testing';

import { FileloadService } from './fileload.service';

describe('FileloadService', () => {
  let service: FileloadService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FileloadService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
