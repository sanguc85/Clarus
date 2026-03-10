import { Injectable, OnInit } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { ToasterService } from './toaster.service';
import { Router } from '@angular/router';
import { Injector } from '@angular/core';
import { DEFAULT_ERROR_MESSAGE } from 'src/app/shared/constants';

@Injectable()

export class CustomErrorHandler implements OnInit {

    public isError: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
    public errorList: any[] = [];

    ngOnInit(): void {
        // throw new Error("Method not implemented.");
    }
    constructor(readonly toasterService: ToasterService, private injector: Injector) {
    }

    public handleHttpError(err: any): void {
    this.setIsError(true);
    if (err.status === 401 || err.statusText === 'UNAUTHORIZED') {
    this.appendMessageToErrorList('Authentication Failed');
    return;
    }
    if (err.status === 403 || err.statusText === 'Forbidden') {
    this.appendMessageToErrorList('You are not authorized');
    return;
    }
    if (err.status === 500 || err.statusText === 'Internal Server Error') {
    const backendMessage =
      (typeof err?.error === 'string' && err.error) ||err?.error?.error ||err?.error?.Message;

    const messageToUse = backendMessage?.trim?.() || DEFAULT_ERROR_MESSAGE;
    this.appendMessageToErrorList(messageToUse);
    return;
  }
    if (err.status === 0 || err.statusText === 'Unknown Error') {
    this.appendMessageToErrorList(DEFAULT_ERROR_MESSAGE);
    return;
    }
    if (typeof err?.error === 'string') {
    this.appendMessageToErrorList(err.error);
    return;
    }
    if (typeof err?.error === 'object') {
    const messageFromObject = err.error?.Message || err.error?.error || JSON.stringify(err.error);
    this.appendMessageToErrorList(messageFromObject);
    return;
    }
    if (typeof err?.message === 'string') {
    this.appendMessageToErrorList(err.message);
    return;
    }
    this.appendMessageToErrorList(DEFAULT_ERROR_MESSAGE);
    }

    
    public handleErrorWithMessage(err: any, message: string): void {
    this.setIsError(true);

    if (err.statusText === 'Forbidden') {
    this.appendMessageToErrorList('You are not authorized, please check with DQG.');
    return;
    }

    let backendMsg = '';

    if (typeof err?.error === 'string') {
    backendMsg = err.error;
    } else if (typeof err?.error === 'object' && err.error?.Message) {
    backendMsg = err.error.Message;
    } else if (typeof err?.message === 'string') {
    backendMsg = err.message;
    }

    const finalMessage = backendMsg ? `${message}, ${backendMsg}` : message;
    this.appendMessageToErrorList(finalMessage);
    }

    public createErrorList(err: any): void{
        this.errorList = [];
        err.error.forEach((element: any) => {
            this.errorList.push(element);
        });
    }

    public appendMessageToErrorList(message: string): void {
  const validMessage = message?.trim() || DEFAULT_ERROR_MESSAGE;
  
  const alreadyExists = this.errorList.some(err =>
    err.Message === validMessage || validMessage.includes(err.Message)
  );

  if (!alreadyExists) {
    this.setIsError(true);
    this.errorList.push({ RowId: 0, Message: validMessage });
  }
}
    

    public clearErrorList(): void{
        this.errorList = [];
        this.setIsError(false);
    }

    public getErrorList(): string []{
        return this.errorList;
    }

    public getIsError(): Observable<boolean> {
        return this.isError.asObservable();
    }

    public setIsError(value: boolean): void {
        this.isError.next(value);
    }

}
