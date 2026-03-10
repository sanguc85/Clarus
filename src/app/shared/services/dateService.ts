import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable()
export class DateService {
    private date$ = new BehaviorSubject<any>({});
    selectedDate$ = this.date$.asObservable();

    constructor() {
    }

    public getDefaultDate(): Date {
        // Handle the default date logic here
        let defaultDate = new Date(this.AddNDays(this.GetTodayDate(), -1)); // Set to todayDate - 1
        this.AdjustForWeekend(defaultDate);
        return defaultDate; // Return the default date
    }

    setDate(date: Date) {
        if(date == null||undefined){
            let defaultDate = new Date(this.AddNDays(this.GetTodayDate(), -2));
            this.AdjustForWeekend(defaultDate); 
            this.date$.next(date); 
        }
        else{
            this.date$.next(date);
        }
      }

    public GetQuarterDate(date: Date): Date {
        const month = date.getMonth() + 1;
        const year = date.getFullYear();
        if (month >= 1 && month <= 3)
            return new Date(year, 0, 1);
        else if (month >= 4 && month <= 6)
            return new Date(year, 3, 1);
        else if (month >= 7 && month <= 9)
            return new Date(year, 6, 1);
        else
            return new Date(year, 9, 1);
    }

    public GetTodayDate(): Date {
        var today = new Date(Date.now());
        return new Date(today.getFullYear(), today.getMonth(), today.getDate());
    }

    public FormatDateToISO(date:Date): string {
       return date.toISOString().split('T')[0];
    }

    public GetDateString(): string {
        var today = new Date(Date.now());
        return this.ConvertDatetoString(today);
    }

    public GetSpecficDateString(date: Date): string {
        return this.ConvertDatetoString(date);
    }

    public ConvertDatetoString(date: Date): string {
        var yyyy = 0;
        var mm = 0;
        var dd = 0;

        if (typeof(date) == 'string'){
            var temp = (date+ '').split('-');
            yyyy = parseInt(temp[0]);
              mm = parseInt(temp[1]);
              dd = parseInt(temp[2]); 
        }
        else{
            var today = new Date(date);
            dd = today.getDate();
            mm = today.getMonth() + 1; //January is 0!
            yyyy = today.getFullYear();
        }
        return yyyy + '-' + ((mm < 10) ? '0' + mm : '' + mm) + '-' + ((dd < 10) ? '0' + dd : '' + dd);
    }

    public formatDate(date: Date) {
        var today = this.ConvertDatetoString(date);
        return today + ' ' + date.getHours() + ':' + date.getMinutes();
    }

    public GetPreviousNthWeekday(date: Date, num: number) {
        var resultDate = new Date(Date.now());
        if (date != null)
            resultDate = new Date(date);

        var i = 0;
        for (i = 0; i < num; i++) {
            this.AdjustForWeekend(resultDate);

            resultDate.setDate(resultDate.getDate() - (i + 1));

            this.AdjustForWeekend(resultDate);
        }

        return resultDate;
    }

    public AdjustForWeekend(date: Date) {
        var dayofWeek = date.getDay();

        if (dayofWeek == 0)
            date.setDate(date.getDate() - 2);
        else if (dayofWeek == 6)
            date.setDate(date.getDate() - 1);
    }

    public ParseDateString(date: string): Date {
        var resultDate = new Date(Date.now());

        if (date.search("today") == -1)
            return new Date(date);

        var splitted = date.split("-", 2);

        return this.GetPreviousNthWeekday(resultDate, +splitted[1]);

        
    }

    public FormatDateString(date: string): string {
        var resultDate = new Date(date);
        return this.ConvertDatetoString(resultDate);
    }
    public GetPreviousYear(date: Date): Date {
        var _date = date;
        _date.setFullYear(_date.getFullYear() - 1);
        return _date;
    }

    public AddNDays(dateInp:Date, num: number) {
        var date = new Date(dateInp);
        var dateNumber = date.getDate();
        var limit = 0; var newDate = null;
        switch (date.getMonth()) {
            case 0:
            case 2:
            case 4:
            case 6:
            case 9:
            case 11:
                limit = 31;
                break;
            case 3:
            case 5:
            case 8:
            case 10:
                limit = 30;
                break;
            default:
                limit = 28;
        }
        if (dateNumber + num > limit)
            newDate = new Date(date.getFullYear(), date.getMonth() + 1, (dateNumber + num) - limit).toLocaleDateString();
        else if (dateNumber + num < 1)
            newDate = new Date(date.getFullYear(), date.getMonth() - 1, (dateNumber + num) + limit).toLocaleDateString();
        else
            newDate = new Date(date.getFullYear(), date.getMonth(), dateNumber+num).toLocaleDateString();
        return newDate;
    }
    public GetPreviousMonth(dateInp:Date,num:number){
        let year = dateInp.getFullYear();
        let month = dateInp.getMonth();

        // Subtract 1 from the month
        month--;

        // If the resulting month is less than 0 (January), adjust year and month accordingly
        if (month < 0) {
            month = 11;  // December
            year--;
        }

        let StartDate = new Date(year, month, 1);
        return StartDate;
    }

    public GetNextMonth(dateInp:Date,num:number){
       let endDate = new Date(
        dateInp.getFullYear(),
        dateInp.getMonth() + 1,
            0
        );
    }
    getDateAsString(date: Date | string): string {
        if (typeof date === 'string') {
            // Check if the date is in ISO format (with 'T')
            if (date.includes('T')) {
                return date.split('T')[0];
            } else {
                return date;
            }
        }
    
        const year = date.getFullYear().toString();
    
        let month = (date.getMonth() + 1).toString().padStart(2, '0');
    
        let day = date.getDate().toString().padStart(2, '0');
    
        return `${year}-${month}-${day}`;
    }
    public GetNumberofDaysOfaMonth(date: Date): number {
        var month = date.getMonth();
        var year = date.getFullYear();
        return new Date(year, month + 1, 0).getDate();
    }
    public getPreviousDateForgivenDate(date: Date): Date {
        const previousDate = new Date(date);
        previousDate.setDate(previousDate.getDate() - 1);
        return previousDate;
    }

    public getPreviousMonthDate(date:Date): Date {
        // Handle the default date logic here
        let numberofDays=this.GetNumberofDaysOfaMonth(date);
        let defaultDate = new Date(this.AddNDays(date, -numberofDays)); // Set to todayDate - 1
        this.AdjustForWeekend(defaultDate);
        return defaultDate; // Return the default date
    }
}