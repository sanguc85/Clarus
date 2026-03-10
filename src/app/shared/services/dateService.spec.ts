import { fakeAsync, TestBed, tick } from '@angular/core/testing';
import { DateService } from './dateService';

describe('DateService', () => {
  let dateService: DateService;
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [DateService]
    });
    dateService = TestBed.inject(DateService);
  });

  it('should be created', () => {
    expect(dateService).toBeTruthy();
  });

  it('should call GetQuarterDate for month >= 1 && month <= 3', () => {
    let date = 'Thu Feb 24 2022 15:29:24 GMT+0000';
    let convertedDate = new Date(date);
    const year = convertedDate.getFullYear();
    let output = new Date(year, 0, 1);
    let spy_GetQuarterDate = spyOn(dateService, 'GetQuarterDate').and.callFake(
      function (convertedDate) {
        return output;
      }
    ).and.callThrough();

    expect(dateService.GetQuarterDate(convertedDate)).toEqual(output);
    expect(spy_GetQuarterDate).toHaveBeenCalled();
  });

  it('should call GetQuarterDate for month >= 4 && month <= 6', () => {
    let date = 'Thu Apr 24 2022 15:29:24 GMT+0000';
    let convertedDate = new Date(date);
    const year = convertedDate.getFullYear();
    let output = new Date(year, 3, 1);
    let spy_GetQuarterDate = spyOn(dateService, 'GetQuarterDate').and.callFake(
      function (convertedDate) {
        return output;
      }
    ).and.callThrough();
    expect(dateService.GetQuarterDate(convertedDate)).toEqual(output);
    expect(spy_GetQuarterDate).toHaveBeenCalled();
  });

  it('should call GetQuarterDate for month >= 7 && month <= 9', () => {
    let date = 'Thu Aug 24 2022 15:29:24 GMT+0000';
    let convertedDate = new Date(date);
    const year = convertedDate.getFullYear();
    let output = new Date(year, 6, 1);
    let spy_GetQuarterDate = spyOn(dateService, 'GetQuarterDate').and.callFake(
      function (convertedDate) {
        return output;
      }
    ).and.callThrough();
    expect(dateService.GetQuarterDate(convertedDate)).toEqual(output);
    expect(spy_GetQuarterDate).toHaveBeenCalled();
  });

  it('should call GetQuarterDate for other cases', () => {
    let date = 'Thu Nov 24 2022 15:29:24 GMT+0000';
    let convertedDate = new Date(date);
    const year = convertedDate.getFullYear();
    let output = new Date(year, 9, 1);
    let spy_GetQuarterDate = spyOn(dateService, 'GetQuarterDate').and.callFake(
      function (convertedDate) {
        return output;
      }
    ).and.callThrough();
    expect(dateService.GetQuarterDate(convertedDate)).toEqual(output);
    expect(spy_GetQuarterDate).toHaveBeenCalled();
  });

  it('should call GetDateString', () => {
    let today: Date = new Date(Date.now());
    let dd = today.getDate();
    let mm = today.getMonth() + 1;
    let yyyy = today.getFullYear();
    let convertedDate = yyyy + '-' + ((mm < 10) ? '0' + mm : '' + mm) + '-' + ((dd < 10) ? '0' + dd : '' + dd);
    let spy_GetDateString = spyOn(dateService, 'ConvertDatetoString').and.callFake(
      function () {
        return convertedDate;
      }
    ).and.callThrough();
    expect(dateService.GetDateString()).toEqual(convertedDate);
    expect(spy_GetDateString).toHaveBeenCalled();
  });

  it('should call GetSpecficDateString', () => {
    let today: Date = new Date('Thu Feb 24 2022 15:29:24 GMT+0000');
    let convertedDate = '2022-02-24';
    let spy_GetDateString = spyOn(dateService, 'ConvertDatetoString').and.callFake(
      function () {
        return convertedDate;
      }
    ).and.callThrough();
    expect(dateService.GetSpecficDateString(today)).toEqual(convertedDate);
    expect(spy_GetDateString).toHaveBeenCalled();
  });

  it('should call ConvertDatetoString for mm<10 and dd<10', () => {
    let today: Date = new Date('Thu Feb 5 2022 15:29:24 GMT+0000');
    let convertedDate = '2022-02-05';
    let spy_ConvertDatetoString = spyOn(dateService, 'ConvertDatetoString').and.callFake(
      function () {
        return convertedDate;
      }
    ).and.callThrough();
    expect(dateService.ConvertDatetoString(today)).toEqual(convertedDate);
    expect(spy_ConvertDatetoString).toHaveBeenCalled();
  });

  it('should call ConvertDatetoString for mm>10 and dd>10', () => {
    let today: Date = new Date('Thu Nov 15 2022 15:29:24 GMT+0000');
    let convertedDate = '2022-11-15';
    let spy_ConvertDatetoString = spyOn(dateService, 'ConvertDatetoString').and.callFake(
      function () {
        return convertedDate;
      }
    ).and.callThrough();
    expect(dateService.ConvertDatetoString(today)).toEqual(convertedDate);
    expect(spy_ConvertDatetoString).toHaveBeenCalled();
  });

  it('should call formatDate', () => {
    let today: Date = new Date('2022-9-15');
    let convertedDate = '2022-09-15 0:0';
    let spy_ConvertDatetoString = spyOn(dateService, 'ConvertDatetoString').and.callFake(
      function () {
        return convertedDate;
      }
    ).and.callThrough();
    expect(dateService.formatDate(today)).toEqual(convertedDate);
    expect(spy_ConvertDatetoString).toHaveBeenCalled();
  });

  it('should call GetPreviousNthWeekday ', () => {
    let today: Date = new Date('wed Jun 01 2022 15:29:24 GMT+0000');
    let resultDate = new Date('Fri May 27 2022 15:29:24 GMT+0000')
    let num = 2;
    let spy_GetPreviousNthWeekday = spyOn(dateService, 'AdjustForWeekend').and
      .callFake(
        function (today) {
          return resultDate;
        }
      ).and.callThrough();
    expect(dateService.GetPreviousNthWeekday(today, num)).toEqual(resultDate);
    expect(spy_GetPreviousNthWeekday).toHaveBeenCalled();
  });

  it('should call ParseDateString with not today', fakeAsync(() => {
    let inputDate: string = '2022-4-27';
    let outputDate: Date = new Date(inputDate);
    let spy_ParseDateString = spyOn(dateService, 'ParseDateString').and
      .callFake(
        function (inputDate) {
          return outputDate;
        }
      ).and.callThrough();
    spyOn(dateService, 'AdjustForWeekend').and.callThrough();
    spyOn(dateService, 'GetPreviousNthWeekday').and.callThrough();
    tick();
    expect(dateService.ParseDateString(inputDate)).toEqual(outputDate);
    expect(spy_ParseDateString).toHaveBeenCalled();
  }));

  it('should call ParseDateString with  today', fakeAsync(() => {
    let inputDate: string = 'today';
    let outputDate: Date = new Date();
    let resultDate = new Date(Date.now());
    let splitted: any = inputDate.split("-", 2);
    let spy_ParseDateString = spyOn(dateService, 'ParseDateString').and
      .callFake(
        function (inputDate) {
          return outputDate;
        }
      ).and.callThrough();
    spyOn(dateService, 'AdjustForWeekend').and.callThrough();
    spyOn(dateService, 'GetPreviousNthWeekday').and.callThrough();
    tick();
    expect(dateService.ParseDateString(inputDate)).toEqual(outputDate);
    dateService.GetPreviousNthWeekday(resultDate, +splitted[1]);
    expect(spy_ParseDateString).toHaveBeenCalled();
  }));

  it('should call FormatDateString', () => {
    let today: string = '2022-04-26';
    let convertedDate = '2022-04-26';
    let spy_ConvertDatetoString = spyOn(dateService, 'ConvertDatetoString').and
      .callFake(
        function (inputDate) {
          return convertedDate;
        }
      ).and.callThrough();
    expect(dateService.FormatDateString(today)).toEqual(convertedDate);
    expect(spy_ConvertDatetoString).toHaveBeenCalled();
  });

  it('should call GetPreviousYear', () => {
    let result_dateString = 'Sun Apr 24 2021 15:29:24 GMT+0000';
    let inputDate: Date = new Date('Sun Apr 24 2022 15:29:24 GMT+0000');
    let resultDate: Date = new Date(result_dateString);
    let spy_GetPreviousYear = spyOn(dateService, 'GetPreviousYear').and
      .callFake(
        function (inputDate) {
          return resultDate;
        }
      ).and.callThrough();
    expect(dateService.GetPreviousYear(inputDate)).toEqual(resultDate);
    expect(spy_GetPreviousYear).toHaveBeenCalled();
  });

  it('should call AddNDays for month jan,Mar,May,Jul,Oct,Dec and date+num>limit', () => {
    let today: string = '2022-01-26';
    let inputDate: Date = new Date(today);
    let limit = 31;
    let num = 6;
    let newDate = new Date(inputDate.getFullYear(), inputDate.getMonth() + 1, (26 + num) - limit).toLocaleDateString();
    let spy_AddNDays = spyOn(dateService, 'AddNDays').and.callThrough();
    expect(dateService.AddNDays(inputDate, num)).toEqual(newDate);
    expect(spy_AddNDays).toHaveBeenCalled();
  });

  it('should call AddNDays for month jan,Mar,May,Jul,Oct,Dec and date+num<1', () => {
    let today: string = '2022-01-01';
    let inputDate: Date = new Date(today);
    let limit = 31;
    let num = -1;
    let newDate = new Date(inputDate.getFullYear(), inputDate.getMonth() - 1, (1 + num) + limit).toLocaleDateString();
    let spy_AddNDays = spyOn(dateService, 'AddNDays').and.callThrough();
    expect(dateService.AddNDays(inputDate, num)).toEqual(newDate);
    expect(spy_AddNDays).toHaveBeenCalled();
  });

  it('should call AddNDays for month jan,Mar,May,Jul,Oct,Dec and date+num>1 and <limit', () => {
    let today: string = '2022-01-02';
    let inputDate: Date = new Date(today);
    let limit = 31;
    let num = 2;
    let newDate = new Date(inputDate.getFullYear(), inputDate.getMonth(), 2 + num).toLocaleDateString();
    let spy_AddNDays = spyOn(dateService, 'AddNDays').and
      .callThrough();
    expect(dateService.AddNDays(inputDate, num)).toEqual(newDate);
    expect(spy_AddNDays).toHaveBeenCalled();
  });

  it('should call AddNDays for month Apr,Jun,Sep,Nov and date+num>limit for default', () => {
    let today: string = '2022-02-26';
    let inputDate: Date = new Date(today);
    let limit = 28;
    let num = 6;
    let newDate = new Date(inputDate.getFullYear(), inputDate.getMonth() + 1, (26 + num) - limit).toLocaleDateString();
    let spy_AddNDays = spyOn(dateService, 'AddNDays').and
      .callThrough();
    expect(dateService.AddNDays(inputDate, num)).toEqual(newDate);
    expect(spy_AddNDays).toHaveBeenCalled();
  });

  it('should call AddNDays for month Apr,Jun,Sep,Nov and date+num>limit', () => {
    let today: string = '2022-04-26';
    let inputDate: Date = new Date(today);
    let limit = 30;
    let num = 6;
    let newDate = new Date(inputDate.getFullYear(), inputDate.getMonth() + 1, (26 + num) - limit).toLocaleDateString();
    let spy_AddNDays = spyOn(dateService, 'AddNDays').and
      .callThrough();
    expect(dateService.AddNDays(inputDate, num)).toEqual(newDate);
    expect(spy_AddNDays).toHaveBeenCalled();
  });

  it('should call AddNDays for month Apr,Jun,Sep,Nov and date+num<1', () => {
    let today: string = '2022-04-01';
    let inputDate: Date = new Date(today);
    let limit = 30;
    let num = -1;
    let newDate = new Date(inputDate.getFullYear(), inputDate.getMonth() - 1, (1 + num) + limit).toLocaleDateString();
    let spy_AddNDays = spyOn(dateService, 'AddNDays').and
      .callThrough();
    expect(dateService.AddNDays(inputDate, num)).toEqual(newDate);
    expect(spy_AddNDays).toHaveBeenCalled();
  });

  it('should call AddNDays for month Apr,Jun,Sep,Nov and date+num>1 and <limit', () => {
    let today: string = '2022-04-02';
    let inputDate: Date = new Date(today);
    let limit = 30;
    let num = 2;
    let newDate = new Date(inputDate.getFullYear(), inputDate.getMonth(), 2 + num).toLocaleDateString();
    let spy_AddNDays = spyOn(dateService, 'AddNDays').and
      .callThrough();
    expect(dateService.AddNDays(inputDate, num)).toEqual(newDate);
    expect(spy_AddNDays).toHaveBeenCalled();
  });

});
