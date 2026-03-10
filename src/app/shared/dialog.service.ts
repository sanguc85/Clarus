import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class DialogService {
  private showDialogSource = new Subject<boolean>();
  showDialog$ = this.showDialogSource.asObservable();
  constructor() {}

  openDialog() {
    this.showDialogSource.next(true);
  }

  closeDialog() {
    this.showDialogSource.next(false);
  }
}
