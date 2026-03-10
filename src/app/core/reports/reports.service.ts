import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, catchError, map, throwError } from 'rxjs';
import { environment } from 'src/environments/environment';
import { saveAs } from 'file-saver';

@Injectable({
  providedIn: 'root',
})
export class ReportsService {
  public baseurl: string;

  constructor(private http: HttpClient) {
    this.baseurl = environment.DataServiceApiUrl;
  }

  public getReportRecpients(reportName: string): Observable<any> {
    const url = this.baseurl + 'Reports/ReportRecipients?reportName=' + reportName;
    return this.http.get(url);
  }

  public getCalculationMethod(counterparty: string, entity: string): Observable<any> {
    const url = this.baseurl + 'InterestCalculationMethod?counterparty=' + counterparty + '&entity=' + entity;
    return this.http.get(url);
  }

  public generateReport(reportName: string, reportType: string, extraParams: any): Observable<any> {
    var url = this.baseurl + 'Reports/' + reportName;
    url += '?reportType=' + reportType.toLowerCase();

    return this.http.post(url, extraParams);
  }

  // 3 more api's to add
  // public getReport(reportName: string, reportType: string, extraParams: any): Observable<any> {}

  // public downloadReport(reportName: string, reportType: string, extraParams: any): Observable<any> {}

  // public clearReportData(reportName: string, dataDate:string, cp:string, entity:string): Observable<any> {}

  public checkUrl(reportName: string, reportType: string, extraParams: any): Observable<any> {
    var url = this.baseurl + 'Reports/CheckUrl?reportName=' + reportName + '&reportType=' + reportType.toLowerCase();
    const params = new HttpParams().set('extraParameters', extraParams);
    return this.http.get(url, { params });
  }

  public setMetaDataTableList(metaDataTables: string[]): Observable<any> {
    const url = this.baseurl + 'ReferenceData/GetRefenceDataTables';
    return this.http.get(url, {
      params: { tableNames: metaDataTables },
    });
  }

  getReport(reportName: string, reportType: string, extraParams: any): Observable<any> {
    
    
    let respType=reportType === 'pdf' || reportType === 'xlsx' ? 'arraybuffer' : 'json';
   
    //const options = {
    //  responseType: respType, 
   
     const  options = {
        responseType: 'blob' as 'json',
        params: new HttpParams().set('extraParameters', JSON.stringify(extraParams)),  
        headers: new HttpHeaders({ 'Content-Type': 'application/json' }),    
        observe: 'response' as 'response',
      };
    
    if (reportName === 'PamCollateral' && reportType === 'xls') {
      reportType = 'xlsx';
    }
    const url = this.baseurl+"Reports/"+reportName+"?reportType="+reportType.toLowerCase();
    //if(reportType === 'pdf' || reportType === 'xlsx' || reportType === 'xls') {
      return this.http.get(url, options);
    // }
    // else
    // {
    //   return this.http.get(url,{params: new HttpParams().set('extraParameters', JSON.stringify(extraParams))});
    // }
  }
  getReportRecipients(reportName: string): Observable<any> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.get<any>(`${this.baseurl}Reports/ReportRecipients?reportName=${reportName}`, { headers, withCredentials: true });
  }
  public sendReport(reportName: string,data:any):Observable<any>{
   
    const url=this.baseurl+'Reports/SendReport?reportName=' + reportName;
    return this.http.post(url,data);
  }
  public clearReportData(reportName:string,DataDate:string, cp:string, entity:string){

    // Using HttpHeaders to set Content-Type to 'application/json' if needed
    const headers = new HttpHeaders().set('Content-Type', 'application/json');
    let url=this.baseurl+'Reports/ReportData?reportName=' + reportName + '&dataDate=' + DataDate;
    if (cp) {
      url+= '&counterparty=' + cp;
    }
    if (entity) {
      url+= '&entity=' + entity;
    }
    return this.http.delete(url,{ headers });
  }
  public downloadReport(reportName: string, reportType: string, extraParams: any): Observable<any> {
    let  options = {
      responseType: 'blob' as 'json',
      params: new HttpParams().set('extraParameters', JSON.stringify(extraParams)),  
      headers: new HttpHeaders({ 'Content-Type': 'application/json' }),    
      observe: 'response' as 'response',
    };
  
    if (reportName === 'PamCollateral' && reportType === 'xls') {
      reportType = 'xlsx';
    }
   
    const url = this.baseurl+"Reports/"+reportName+"?reportType="+reportType.toLowerCase();
    //if(reportType === 'pdf' || reportType === 'xlsx' || reportType === 'xls') {
    return this.http.get(url, options);
  }
}


