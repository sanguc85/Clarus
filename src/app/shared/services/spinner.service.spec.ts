import { TestBed } from '@angular/core/testing';
import { BehaviorSubject } from 'rxjs';

import { SpinnerService } from './spinner.service';

describe('SpinnerService', () => {
  let spinnerService: SpinnerService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    spinnerService = TestBed.inject(SpinnerService);
  });

  it('should be created', () => {
    expect(spinnerService).toBeTruthy();
  });

  it('should call show', () => {
    let _loading = new BehaviorSubject<boolean>(false);
    let spy_Loading = spyOn(spinnerService, 'show').and.callThrough();
    spinnerService.show();
    expect(spy_Loading).toHaveBeenCalled();
  });

  it('should call hide', () => {
    let _loading = new BehaviorSubject<boolean>(false);
    let spy_Loading = spyOn(spinnerService, 'hide').and.callThrough();
    spinnerService.hide();
    expect(spy_Loading).toHaveBeenCalled();
  });
});
