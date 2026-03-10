import { HttpClientTestingModule, HttpTestingController } from "@angular/common/http/testing";
import { TestBed } from "@angular/core/testing";
import { CustomErrorHandler } from "./error-handler.service";

describe('ToasterService', () => {
    let service: CustomErrorHandler;
    let httpController: HttpTestingController;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
            providers: [CustomErrorHandler]
        });
        service = TestBed.inject(CustomErrorHandler);
        httpController = TestBed.inject(HttpTestingController);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should call handleHttpError for status Forbidden', () => {

        let err = {
            statusText: 'Forbidden'
        }
        let spy_setIsError = spyOn(service, 'setIsError').and.callThrough();
        let spy_append = spyOn(service, 'appendMessageToErrorList').and.callThrough();
        service.handleHttpError(err);
        expect(spy_append).toHaveBeenCalledWith('You are not authorized, please check with DQG.');
        expect(spy_setIsError).toHaveBeenCalled();
    });

    it('should call handleHttpError for err.error.message not empty', () => {

        let err = {
            error: {
                Message: 'Message'
            }
        }
        let spy_setIsError = spyOn(service, 'setIsError').and.callThrough();
        let spy_append = spyOn(service, 'appendMessageToErrorList').and.callThrough();
        service.handleHttpError(err);
        expect(spy_append).toHaveBeenCalledWith(err.error.Message);
        expect(spy_setIsError).toHaveBeenCalled();
    });

    it('should call handleHttpError for err.message not empty', () => {

        let err = {
            error: {
            },
            message: 'Test message'
        };
        let spy_setIsError = spyOn(service, 'setIsError').and.callThrough();
        let spy_append = spyOn(service, 'appendMessageToErrorList').and.callThrough();
        service.handleHttpError(err);
        expect(spy_append).toHaveBeenCalledWith(err.message);
        expect(spy_setIsError).toHaveBeenCalled();
    });

    it('should call handleHttpError for error message is empty or undefined', () => {

        let err = {
            error: {
            },
            message: undefined
        };

        let spy_setIsError = spyOn(service, 'setIsError').and.callThrough();
        let spy_append = spyOn(service, 'appendMessageToErrorList').and.callThrough();
        service.handleHttpError(err);
        expect(spy_append).toHaveBeenCalledWith('Unknown Error occurred. Please check with DQG');
        expect(spy_setIsError).toHaveBeenCalled();
    });

    it('should call handleErrorWithMessage and error.statusText is Forbidden', () => {
        let message = 'Test message';
        let err = {
            statusText: 'Forbidden'
        }
        let spy_setIsError = spyOn(service, 'setIsError').and.callThrough();
        let spy_append = spyOn(service, 'appendMessageToErrorList').and.callThrough();
        service.handleErrorWithMessage(err, message);
        expect(spy_append).toHaveBeenCalledWith('You are not authorized, please check with DQG.');
        expect(spy_setIsError).toHaveBeenCalled();
    });

    it('should call handleErrorWithMessage for err.error.message not empty', () => {
        let message = 'Test message';
        let err = {
            error: {
                Message: 'Message'
            }
        }
        let spy_setIsError = spyOn(service, 'setIsError').and.callThrough();
        let spy_append = spyOn(service, 'appendMessageToErrorList').and.callThrough();
        service.handleErrorWithMessage(err, message);
        expect(spy_append).toHaveBeenCalledWith(`${message}, ${err.error.Message}`);
        expect(spy_setIsError).toHaveBeenCalled();
    });

    it('should call handleErrorWithMessage for err.error.message not empty', () => {
        let message = 'Test message';
        let err = {
            error: {
                Message: ''
            },
            message: undefined
        };
        let spy_setIsError = spyOn(service, 'setIsError').and.callThrough();
        let spy_append = spyOn(service, 'appendMessageToErrorList').and.callThrough();
        service.handleErrorWithMessage(err, message);
        expect(spy_append).toHaveBeenCalledWith(`${message}, ${err.message}`);
        expect(spy_setIsError).toHaveBeenCalled();
    });

    it('should call createErrorList', () => {
        let err = {
            error: [{
                Message: ''
            },
            {
                Message: 'Test Message'
            }],
            message: undefined
        };
        let spy_createErrorList = spyOn(service, 'createErrorList').and.callThrough();
        service.createErrorList(err);
        expect(spy_createErrorList).toHaveBeenCalledWith(err);
    });

    it('should call appendMessageToErrorList', () => {
        let message = 'Test Message';
        service.errorList = [];
        let spy_setIsError = spyOn(service, 'setIsError').and.callThrough();
        service.appendMessageToErrorList(message);
        expect(spy_setIsError).toHaveBeenCalledWith(true);
        expect(service.errorList.length).toEqual(1);
    });
    it('should call clearErrorList', () => {
        service.errorList = [];
        let spy_setIsError = spyOn(service, 'setIsError').and.callThrough();
        service.clearErrorList();
        expect(spy_setIsError).toHaveBeenCalledWith(false);
    });

    it('should call getErrorList', () => {
        service.errorList = [];
        let spy_getErrorList = spyOn(service, 'getErrorList').and.callThrough();
        service.getErrorList();
        expect(spy_getErrorList).toHaveBeenCalled();
    });
});