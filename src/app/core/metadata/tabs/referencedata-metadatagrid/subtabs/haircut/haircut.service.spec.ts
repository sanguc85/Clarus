import { TestBed } from '@angular/core/testing';

import { HaircutService } from './haircut.service';

describe('HaircutService', () => {
  let service: HaircutService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(HaircutService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
