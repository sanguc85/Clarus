import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})

export class CollateralmovementService {
  public baseurl: string;

  constructor(private http: HttpClient) {
    this.baseurl = environment.DataServiceApiUrl;
  }
  
  public getCollateralMovements(startDate:string,endDate:string):Observable<any>{
    const url = this.baseurl + "CollateralMovement/GetCollateralMovement?startDate=" + startDate + "&endDate=" + endDate;
    return this.http.get(url);
  }
  public getCollateralSummary(dataDate:string):Observable<any>{
    const url = this.baseurl + "CollateralMovement/CollateralSummary?dataDate=" + dataDate;
    return this.http.get(url);
  }
  public sendMovementReport(dataDate:string,MvList:any):Observable<any>{
    let data:any={
      DataDate: dataDate,
      MvList: MvList
    };
    const url=this.baseurl+'Reports/SendReport?reportName=CashCollateralMovements';
    return this.http.post(url,data);
  }
  public getCounterpartyDailyMargin(startDate:string,endDate:string):Observable<any>{
    const url = this.baseurl + "DailyMargin/GetCounterpartyDailyMarginList?startDate=" + startDate + "&endDate=" + endDate;
    return this.http.get(url);
  }
  public getDailyMargin(startDate:string,endDate:string):Observable<any>{
    const url = this.baseurl + "DailyMargin/GetDailyMarginList?startDate=" + startDate + "&endDate=" + endDate;
    return this.http.get(url);
  }
  public getReportDataList(startDate:string,endDate:string):Observable<any>{
    const url = this.baseurl + "DailyMargin/GetReportDataList?startDate=" + startDate + "&endDate=" + endDate;
    return this.http.get(url);
  }
   public getEstimateMovementData(startDate:string,endDate:string):Observable<any>{
    const url = this.baseurl + "CollateralMovement/GetEstimatedMovement?startDate=" + startDate + "&endDate=" + endDate;
    return this.http.get(url);
  }
}
