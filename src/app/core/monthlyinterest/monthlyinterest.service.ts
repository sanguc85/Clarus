import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})

export class MonthlyinterestService {

  public baseurl: string;

  constructor(private http: HttpClient) {
    this.baseurl = environment.DataServiceApiUrl;
  }
  
  public getMonthlyInterestSummary(startDate:string,endDate:string):Observable<any>{
    const url = this.baseurl + "MonthlyInterest?startDate=" + startDate + "&endDate=" + endDate;
    return this.http.get(url);
  }
  public getMonthlyInterestDetail(startDate:string,endDate:string,cp:string,entity:string,rateType:string,method:string):Observable<any>{
    var url = this.baseurl + "MonthlyInterest/" + method;
    url += "?startDate=" + startDate;
    url += "&endDate=" + endDate;
    url += "&counterparty=" + cp;
    url += "&entity=" + entity;
    if (rateType != null) {
        url += "&rateType=" + rateType;
    }
    return this.http.get(url);
  }
  public saveComment(monthlyInterest:any,startDate:string,endDate:string):Observable<any>{
    
    const url=this.baseurl+"MonthlyInterest/SaveComment?startDate=" + startDate + "&endDate=" + endDate;
    return this.http.post(url,monthlyInterest);
  }
  public sendWireRequest(newDataDate:string,startDate:string,endDate:string,cp:string,entity:string,rateType:string,amount:number):Observable<any>{
    let data:any={DataDate: newDataDate,
                StartDate: startDate,
                EndDate: endDate,
                Counterparty: cp,
                Entity: entity,
                Collateral: null,
                Type: null,
                RateType: rateType,
                Amount: amount};
    const url=this.baseurl+'Reports/Send/Wire/MonthlyInterest';
    return this.http.post(url,data);
  }
  public saveMonthlyInterest(monthlyInterest:any[],startDate:string,endDate:string):Observable<any>{
    
    const url=this.baseurl+'MonthlyInterest?startDate=' + startDate + '&endDate=' + endDate;
    return this.http.post(url,monthlyInterest);
  }
  public setMetaDataTableList(metaDataTables:string[]){
    const url=this.baseurl+'ReferenceData/GetRefenceDataTables';
    return this.http.get(url, {
      params: { tableNames: metaDataTables },
    });
  }
  public getCalculationMethod(cp: string, entity: string): Observable<any>{
    const options = {
      responseType: 'text' as 'text',
      observe: 'response' as 'response',
    };
    const url = this.baseurl + "InterestCalculationMethod?counterparty=" + cp + "&entity=" + entity;
    return this.http.get(url, options);
  }
}
