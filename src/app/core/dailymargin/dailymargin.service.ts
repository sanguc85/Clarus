import {HttpClient, HttpHeaders} from '@angular/common/http'
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class DailymarginService {

  public baseurl: string;

  constructor(private http: HttpClient) {
    this.baseurl = environment.DataServiceApiUrl;
  }
  public getDailyMarginData(dataDate:string):Observable<any>{
   
    const url=this.baseurl+'DailyMargin/GetDailyMargin?dataDate='+dataDate;
    return this.http.get(url);
  }
   public getLastDailyMargin(dataDate:string):Observable<any>{
   
    const url=this.baseurl+'DailyMargin/GetLastDailyMargin?dataDate='+dataDate;
    return this.http.get(url);
  }
  public downloadUserGuide():Observable<any>{
    const options = {
      responseType: 'blob' as 'json',
      headers: new HttpHeaders({ 'Content-Type': 'application/json' }),  
      observe: 'response' as 'response',
    };
    const url=this.baseurl+'UserGuide';
    return this.http.get(url,options);
  }
  public getTradeDetails(dataDate:string,counterParty:string,entity:string):Observable<any>{
   
    const url=this.baseurl+'DailyMargin/GetTradeDetails?dataDate=' + dataDate + '&counterparty=' + counterParty + '&entity=' + entity;
    return this.http.get(url);
  }
  public getCPTradeDetails(dataDate:string,counterParty:string,entity:string):Observable<any>{
   
    const url=this.baseurl+'DailyMargin/GetCounterpartyTradeDetails?dataDate=' + dataDate + '&counterparty=' + counterParty + '&entity=' + entity;
    return this.http.get(url);
  }
  public getCollateralDetails(dataDate:string,counterParty:string,entity:string):Observable<any>{
   
    const url=this.baseurl+'DailyMargin/GetCollateralDetails?dataDate=' + dataDate + '&counterparty=' + counterParty + '&entity=' + entity;
    return this.http.get(url);
  }
  public getCPCollateralDetails(dataDate:string,counterParty:string,entity:string):Observable<any>{
   
    const url=this.baseurl+'DailyMargin/GetCounterpartyCollateralDetails?dataDate=' + dataDate + "&counterparty=" + counterParty + "&entity=" + entity;
    return this.http.get(url);
  }
  public getCollateralBalances(dataDate:string):Observable<any>{
   
    const url=this.baseurl+'DailyMargin/GetCollateralBalances?dataDate=' + dataDate;
    return this.http.get(url);
  }
  public getCounterpartyDailyMargin(dataDate:string):Observable<any>{
   
    const url=this.baseurl+'DailyMargin/GetCounterpartyDailyMargin?dataDate=' + dataDate;
    return this.http.get(url);
  }
  public getUseCp(dataDate:string,counterParty:string,entity:string):Observable<any>{
   
    const url=this.baseurl+'DailyMargin/UseCp?dataDate=' + dataDate + '&counterparty=' + counterParty + '&entity=' + entity;
    return this.http.get(url);
  }
  public getSingleCollateralMovement(dataDate:string,counterParty:string,entity:string):Observable<any>{
   
    const url=this.baseurl+'DailyMargin/GetSingleCollateralMovement?dataDate=' + dataDate + '&counterparty=' + counterParty + '&entity=' + entity;
    return this.http.get(url);
  }
  public deleteCollateralMovement(movement:any)  {
    let data:any=[];
    const url = this.baseurl + 'DailyMargin/DeleteCollateralMovement?id=' + movement.Id;
    return this.http.post(url,data);
  }
  public deleteAllCollateralMovements(dataDate:string,counterParty:string,entity:string)  {
    let data:any=[];
    const url = this.baseurl + 'DailyMargin/DeleteAllCollateralMovements?counterparty=' + counterParty +'&entity=' + entity+'&dataDate=' + dataDate;
    return this.http.post(url,data);
  }
  public reOpen(dataDate:string)  {
    let data:any=[];
    const url = this.baseurl + 'DailyMargin/Reopen?dataDate=' + dataDate;
    return this.http.post(url,data);
  }
  public markComplete(dataDate:string)  {
    let data:any=[];
    const url = this.baseurl + 'DailyMargin/MarkComplete?dataDate=' + dataDate;
    return this.http.post(url,data);
  }
  public getAllSecurities(dataDate:string):Observable<any>{
   
    const url=this.baseurl+'DailyMargin/GetSecurities?dataDate=' + dataDate;
    return this.http.get(url);
  }
  public sendWireRequest(dataDate:string,counterParty:string,entity:string,addressList:any[],amount:Number):Observable<any>{
    let data:any={
      DataDate: dataDate,
      Counterparty: counterParty,
      Entity: entity,
      Addresses: addressList,
      Amount: amount};
    const url=this.baseurl+'Reports/Send/Wire/CollateralCall';
    return this.http.post(url,data);
  }
  public sendTripartyMovement(dataDate:string,counterParty:string,entity:string,addressList:any[]):Observable<any>{
    let data:any={
      DataDate: dataDate,
      Counterparty: counterParty,
      Entity: entity,
      Addresses: addressList};
    const url=this.baseurl+'Reports/SendReport?reportName=TriPartyMovement';
    return this.http.post(url,data);
  }
  public sendCollateralCall(extraParams:any):Observable<any>{
    
    const url=this.baseurl+'Reports/SendReport?reportName=CollateralCall';
    return this.http.post(url,extraParams);
  }
  public saveCollateralMovement(security:any[],dtDate:string):Observable<any>{
    
    const url=this.baseurl+'DailyMargin/SaveCollateralMovements?dataDate=' + dtDate;
    return this.http.post(url,security);
  }
  public saveMarginData(dailyMargin:any[],dtDate:string):Observable<any>{
    
    const url=this.baseurl+'DailyMargin/SaveMarginData?dataDate=' + dtDate;
    return this.http.post(url,dailyMargin);
  }
  public saveComment(dailyMargin:any,dtDate:string,cp:string):Observable<any>{
    
    const url=this.baseurl+'DailyMargin/SaveComment?dataDate=' + dtDate + '&counterparty=' + cp;
    return this.http.post(url,dailyMargin);
  }
  public clearAndRefreshDailyMargin(dtDate:string,counterParties:any[]):Observable<any>{
    
    const url=this.baseurl+'DailyMargin/RefreshData?dataDate=' + dtDate;
    return this.http.post(url,counterParties);
  }
  public getBusinessDaysBetween(dataDate:any,todayDate:any):Observable<any>{
   
    const url=this.baseurl+'DailyMargin/GetBusinessDaysBetween?dataDate='+dataDate + '&todayDate=' + todayDate;
    return this.http.get(url);
  }
}