import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class SubstitutionService {

  public baseurl: string;

  constructor(private http: HttpClient) {
    this.baseurl = environment.DataServiceApiUrl;
  }

  public getData(dataDate:string):Observable<any>{
    const url = this.baseurl + 'Substitution/GetCollateral?dataDate=' + dataDate;
    return this.http.get(url);
  }

  public getSecurities(dataDate:string):Observable<any>{
    const url = this.baseurl + 'Substitution/GetSecurities?dataDate=' + dataDate;
    return this.http.get(url);
  }
  public getFullSubstitution(dataDate:string,counterparty:string):Observable<any>{
    const url = this.baseurl + 'Substitution/GetFullSubstitution?dataDate=' + dataDate + '&counterparty=' + counterparty;
    return this.http.get(url);
  }
  public getCUSIPS(dataDate:string, counterparty?: string, entity?: string):Observable<any>{
    let url = this.baseurl + 'Substitution/GetCusips?dataDate=' + dataDate;
    if (counterparty) {
      url += '&counterparty=' + counterparty;
    }
    if (entity) {
      url += '&entity=' + entity;
    }
    return this.http.get(url);
  }
  public getRecentRequests():Observable<any>{
    const url = this.baseurl + 'NewSecurity/PendingRequests';
    return this.http.get(url);
  }

  public requestNewSecurity(cusip:string):Observable<any>{
    const url = this.baseurl + 'NewSecurity/SendSecurityRequest?name=' + cusip;
    return this.http.post(url, cusip);
  }

  public addToRequestBuilder(cusip:string):Observable<any>{
    const url = this.baseurl + 'NewSecurity/AddSecurityToRequest?cusip=' + cusip;
    return this.http.put(url, cusip);
  }

  public addSecurityToMaster(id:any):Observable<any>{
    const url = this.baseurl + 'NewSecurity/AddSecurityToMaster?id=' + id;
    return this.http.post(url, id);
  }

  public getSecurityPrice(cusip:string):Observable<any>{
    const url = this.baseurl + 'NewSecurity/FetchSecurityPrice?cusip=' + cusip;
    return this.http.put(url, cusip);
  }
  public saveSubstitutions(newSecurities:any[],dtDate:string):Observable<any>{
    
    const url=this.baseurl+'Substitution/SaveAllSubstitutions?dataDate=' + dtDate;
    return this.http.post(url,newSecurities);
  }
  public deleteCollateralMovement(movement:any)  {
    let data:any=[];
    const url = this.baseurl + 'CollateralMovement/DeleteCollateralMovement?id=' + movement.Id;
    return this.http.post(url,data);
  }
}
