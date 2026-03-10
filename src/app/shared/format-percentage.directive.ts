import { Directive, ElementRef, HostListener, Input, Renderer2  } from '@angular/core';
import { NgControl } from '@angular/forms';
import { DatePipe } from '@angular/common';

@Directive({
  selector: '[appPercentInput]',
})
export class FormatPercentageDirective {
  constructor(private el: ElementRef, private renderer: Renderer2, private ngControl: NgControl) {}

  @Input('appPercentInput') decimalPlaces: number = 2;

  @HostListener('input', ['$event.target.value'])
  onInput(value: string): void {
    const numericValue = parseFloat(value.replace('%', '')); // Remove '%' and parse to a number
    if (!isNaN(numericValue)) {
      // Format the input value as a percentage
      const formattedValue = (numericValue / 100).toFixed(this.decimalPlaces);
      this.renderer.setProperty(this.el.nativeElement, 'value', formattedValue + '%');
      if (this.ngControl.control) {
        this.ngControl.control.setValue(numericValue / 100); // Set the ngModel value
      }
    } else {
      this.renderer.setProperty(this.el.nativeElement, 'value', '');
      if (this.ngControl.control) {
        this.ngControl.control.setValue(null); // Handle invalid input
      }
      
    }
  }
}

@Directive({
  selector: '[appFormatTimeString]'
})
export class FormatTimeStringDirective {

  constructor(private el: ElementRef, private NgControl: NgControl, private datePipe: DatePipe) { }

  @HostListener('ngModelChange', ['$event'])
  onModelChange(value: any) {
    const formattedValue = this.formatDate(value);
    this.NgControl.control?.setValue(formattedValue);
  }

  private formatDate(value: any): string {
    if (value === 0) {
      const today = new Date();
      return this.datePipe.transform(today, 'yyyy-MM-dd') || '';
    } else if (value.startsWith('t+') && !isNaN(+value.slice(2))) {
      const daysToAdd = +value.slice(2);
      const today = new Date();
      const futureDate = new Date(today.setDate(today.getDate() + daysToAdd));
      return this.datePipe.transform(futureDate, 'yyyy-MM-dd') || '';
    } else {
      // If the value doesn't match 't' or 't+N' format, return it as is
      return value;
    }
  }
}



@Directive({
  selector: '[formatDateString]'
})
export class FormatDateStringDirective {
  constructor(private el: ElementRef) { }
  ngOnInit() {
    const initalValue = this.el.nativeElement.value;
    if (initalValue === '0') {
      this.el.nativeElement.value = 'T';
    } else if (initalValue > 0) {   
      this.el.nativeElement.value = 'T+'+initalValue;
    }
    else{
      this.el.nativeElement.value=initalValue;
    }
   
    if (!Number.isInteger(Number(initalValue))) {
      this.el.nativeElement.value = false;
      if (initalValue !== this.el.nativeElement.value) {
        event.stopPropagation();
      }
    }
  }
  ngAfterViewInit() {
    const initalValue = this.el.nativeElement.value;
    if (initalValue === '0') {
      this.el.nativeElement.value = 'T';
    } else if (initalValue > 0) {   
      this.el.nativeElement.value = 'T+'+initalValue;
    }
    else{
      this.el.nativeElement.value=initalValue;
    }
   
    if (!Number.isInteger(Number(initalValue))) {
      this.el.nativeElement.value = false;
      if (initalValue !== this.el.nativeElement.value) {
        event.stopPropagation();
      }
    }
  }
  ngAfterContentInit() {
    const initalValue = this.el.nativeElement.value;
    if (initalValue === '0') {
      this.el.nativeElement.value = 'T';
    } else if (initalValue > 0) {   
      this.el.nativeElement.value = 'T+'+initalValue;
    }
    else{
      this.el.nativeElement.value=initalValue;
    }
   
    if (!Number.isInteger(Number(initalValue))) {
      this.el.nativeElement.value = false;
      if (initalValue !== this.el.nativeElement.value) {
        event.stopPropagation();
      }
    }
  }
  @HostListener('input', ['$event']) onInputChange(event) {
    const initalValue = this.el.nativeElement.value;
    if (initalValue === '0') {
      this.el.nativeElement.value = 'T';
    } else if (initalValue > 0) {   
      this.el.nativeElement.value = 'T+'+initalValue;
    }
    else{
      this.el.nativeElement.value=initalValue;
    }
   
    if (!Number.isInteger(Number(initalValue))) {
      this.el.nativeElement.value = false;
      if (initalValue !== this.el.nativeElement.value) {
        event.stopPropagation();
      }
    }
  }
}