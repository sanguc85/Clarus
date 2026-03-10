import { Directive, ElementRef, HostListener } from '@angular/core';

@Directive({
  selector: '[appCommaSeparated]'
})
export class CommaSeparatedDirective {

  constructor(private el: ElementRef) { }
  @HostListener('blur') onBlur(): void {
    // Get current input value
    let value: string = (this.el.nativeElement as HTMLInputElement).value;

    // Remove existing commas (if any)
    value = value.replace(/,/g, '');

    // Format the value with commas
    const formattedValue = this.formatWithCommas(value);

    // Update the input element's value with the formatted version
    (this.el.nativeElement as HTMLInputElement).value = formattedValue;
  }

  private formatWithCommas(value: string): string {
    // Convert value to number (if possible) and format with commas
    const numberValue = parseFloat(value);
    if (!isNaN(numberValue)) {
      return numberValue.toLocaleString('en-US');
    } else {
      return value; // Return original value if conversion fails
    }
  }
}
