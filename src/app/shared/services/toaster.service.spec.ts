import { HttpClientTestingModule, HttpTestingController } from "@angular/common/http/testing";
import { fakeAsync, TestBed, tick } from "@angular/core/testing";
import { of, Subject } from "rxjs";
import { ToasterService } from "./toaster.service";

describe('ToasterService', () => {
    let service: ToasterService;
    let httpController: HttpTestingController;
    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
            providers: [ToasterService]
        });
        service = TestBed.inject(ToasterService);
        httpController = TestBed.inject(HttpTestingController);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should call toast', () => {
        let message = 'Servie Tested successfully';
        let spy_toaster = spyOn(service, 'toast').and.callThrough();
        service.toast(message);
        expect(spy_toaster).toHaveBeenCalledWith(message);
    });

    it('should call getMessage', fakeAsync(() => {
        (service as any).toastMessageSubject = new Subject<string>();
        let spy_getMessage = spyOn(service, 'getMessage').and.callThrough();
        service.getMessage();
        tick();
        expect(spy_getMessage).toHaveBeenCalled();
    }));

});