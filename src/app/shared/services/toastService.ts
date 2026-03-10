import { Injectable, ViewChild } from '@angular/core';
import { IgxToastComponent, IgxToastPosition } from '@infragistics/igniteui-angular';

@Injectable()

export class ToastService {
    @ViewChild('toastHandler') public toastHandler!: IgxToastComponent;

    public toastPosition: IgxToastPosition;
    public toastMessage!: string;

    constructor() {
        this.toastPosition = IgxToastPosition.Top;
        this.toastHandler.open();
    }
    public makeToast(message: string) {
        this.toastMessage = message ;
        this.toastHandler.open();
        
    }
}

