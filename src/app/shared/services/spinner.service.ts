import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SpinnerService {

  private _spinner = new BehaviorSubject<boolean>(false);
  public readonly spinner$ = this._spinner.asObservable();
  constructor() { }
  show() {
    this._spinner.next(true);
  }

  hide() {
    this._spinner.next(false);
  }
}

