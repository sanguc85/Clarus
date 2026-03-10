import { Injectable } from '@angular/core';
import { Subject, Observable } from 'rxjs';

/**
 * This is the toaster service,
 * it provides components a way to signal emit toasts on the app.
 */
@Injectable({
    providedIn: 'root'
})
export class ToasterService {
    /**
     * The private object that holds the toast message.
     */
    private toastMessageSubject: Subject<string> = new Subject<string>();

    /**
     * Sets the is message property to what should be toasted.
     */
    public toast(message: string): void {
        this.toastMessageSubject.next(message);
    }

    /**
     * Gets the is loading property.
     */
    public getMessage(): Observable<string> {
        return this.toastMessageSubject.asObservable();
    }
}
