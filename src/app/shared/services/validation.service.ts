import { Injectable } from '@angular/core';
import { AbstractControl, FormGroup, ValidationErrors, ValidatorFn } from '@angular/forms';

@Injectable({
  providedIn: 'root'
})
export class ValidationService {
  emailRegex = /^[a-zA-Z0-9]+([._%+-]?[a-zA-Z0-9]+)*@[a-zA-Z0-9-]+(\.[a-zA-Z]{2,})+$/;
  constructor() { }
  public noLeadingTrailingSpacesValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = control.value || '';
      if (value.trim() !== value) {
        return { noLeadingTrailingSpaces: true };
      }
      return null;
    };
  }

  atLeastOneFieldValidator(): ValidatorFn {
    return (formGroup: AbstractControl): ValidationErrors | null => {
      const controls = formGroup.value;
      const hasValue = Object.values(controls).some(value => value);
      return hasValue ? null : { required: true };
    };
  }

  isAtLeastOneFieldNonEmpty(rowData: any): boolean {
    return Object.keys(rowData)
      .filter(key => key !== 'Id' && key !== 'Counterparty')
      .some(key => rowData[key] !== null && rowData[key] !== '');
  }

  validateEmail(email: string): boolean {
    return this.emailRegex.test(email);
  }

  customEmailValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const valid = this.emailRegex.test(control.value);
      return valid ? null : { invalidEmail: true };
    };
  }

}
