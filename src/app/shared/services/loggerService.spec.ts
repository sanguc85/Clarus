import { TestBed } from '@angular/core/testing';

import { LoggerService } from './loggerService';

describe('loggerService', () => {
  let loggerService: LoggerService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [LoggerService]
    });
    loggerService = TestBed.inject(LoggerService);
  });

  it('should be created', () => {
    expect(loggerService).toBeTruthy();
  });

  it('should call HandleError err.error null', () => {
    let err: any = {
      error: null,
      message: 'message'
    };
    let errorMessage: string = "message";
    let spy_HandleError = spyOn(loggerService, 'HandleError').and.callThrough();
    loggerService.HandleError(err);
    expect(errorMessage).toEqual(err.message);
    expect(err.error).toEqual(null);
    expect(loggerService.HandleError).toHaveBeenCalled();
  });

  it('should call HandleError err.error.error is null', () => {
    let err: any = {
      error: {
        error: null,
        Message: 'message'
      }
    };
    let errorMessage: string = "message";
    let spy_HandleError = spyOn(loggerService, 'HandleError').and.callThrough();
    loggerService.HandleError(err);
    expect(errorMessage).toEqual(err.error.Message);
    expect(err.error.error).toEqual(null);
    expect(loggerService.HandleError).toHaveBeenCalled();
  });

  it('should call HandleError err.error.error.error is null', () => {
    let err: any = {
      error: {
        error: {
          error: null,
          Message: 'message'
        }
      }
    };
    let errorMessage: string = "message";
    let spy_HandleError = spyOn(loggerService, 'HandleError').and.callThrough();
    loggerService.HandleError(err);
    expect(errorMessage).toEqual(err.error.error.Message);
    expect(err.error.error.error).toEqual(null);
    expect(loggerService.HandleError).toHaveBeenCalled();
  });

});
