
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class CounterpartydetailsService {

  public baseurl: string;
  public loadurl: string;
  constructor(private http: HttpClient) {
    this.baseurl = environment.DataServiceApiUrl;
    this.loadurl = environment.LoaderApiUrl;
  }
  public setMetaDataTableList(metaDataTables: string[]) {
    const url = this.baseurl + 'ReferenceData/GetRefenceDataTables';
    return this.http.get(url, {
      params: { tableNames: metaDataTables },
    });
  }
  public getCounterpartySummary(counterparty: string) {
    const url = this.baseurl + 'CounterpartyDetails/GetCounterpartySummary?counterparty=' + counterparty;
    return this.http.get(url);
  }
  public getCounterpartyRating(counterparty: string) {
    const url = this.baseurl + 'GetRatingsTable?counterparty=' + counterparty;
    return this.http.get(url);
  }
  public getCounterpartyDetails(counterparty: string, entity: string) {
    const url = this.baseurl + 'CounterpartyDetails/GetCounterparty?counterparty=' + counterparty + '&entity=' + entity;
    return this.http.get(url);
  }
  public getAuthorizedProducts(counterparty: string, entity: string) {
    const url = this.baseurl + 'CounterpartyDetails/GetAuthorizedProducts?counterparty=' + counterparty + '&entity=' + entity;
    return this.http.get(url);
  }
  public getDocument(docType: string, counterparty: string, entity: string) {
    const url = this.baseurl + 'Documentation/' + docType + '?counterparty=' + counterparty + '&entity=' + entity;
    return this.http.get(url);
  }
  public getCounterpartyContacts(counterparty: string) {
    const url = this.baseurl + 'GetAllContacts?counterparty=' + counterparty;
    return this.http.get(url);
  }
  public getDeliveryInstructions(counterparty: string, entity: string) {
    const url = this.baseurl + 'GetCounterpartyDeliveryInstructions?counterparty=' + counterparty + '&entity=' + entity;
    return this.http.get(url);
  }
  public getNotificationTimes(counterparty: string, entity: string) {
    const url = this.baseurl + 'CounterpartyDetails/GetNotificationTimes?counterparty=' + counterparty + '&entity=' + entity;
    return this.http.get(url);
  }
  public getEligibleAssets(counterparty: string, entity: string) {
    const url = this.baseurl + 'GetEligibleCollateral?counterparty=' + counterparty + '&entity=' + entity;
    return this.http.get(url);
  }
  public getHaircut(counterparty: string, entity: string, haircutType: string) {
    const url = this.baseurl + 'GetHaircut?counterparty=' + counterparty + '&entity=' + entity + '&haircutType=' + haircutType;
    return this.http.get(url);
  }
  public getRatingsEvent(counterparty: string, entity: string) {
    const url = this.baseurl + 'CounterpartyDetails/GetRatingsEvent?counterparty=' + counterparty + '&entity=' + entity;
    return this.http.get(url);
  }
  public getRepoDetails(counterparty: string, entity: string) {
    const url = this.baseurl + 'CounterpartyDetails/GetRepoDetails?counterparty=' + counterparty + '&entity=' + entity;
    return this.http.get(url);
  }
  public saveData(data: any): Observable<any> {
    const url = this.baseurl + 'CounterpartyDetails/SaveData';
    return this.http.post(url, data);
  }
  public saveDocument(data: any, docType: string): Observable<any> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    // Define your request options, including headers and body
    const httpOptions = {
      headers: headers
    };
    const url = this.baseurl + 'Documentation/Save' + docType;
    return this.http.post(url, data);
  }
  public addNewCounterparty(newCPData: any): Observable<any> {
    const url = this.baseurl + 'CounterpartyDetails/AddNew';
    return this.http.post(url, newCPData);
  }
  public ExportToExcel(counterparty: string, entity: string): Observable<any> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
    });

    // Set the responseType to 'arraybuffer'
    const options = {
      responseType: 'blob' as 'json',
      observe: 'response' as 'response',
    };

    const url = this.baseurl + 'CounterpartyDetails/ExportToExcel?counterparty=' + counterparty + '&entity=' + entity;
    return this.http.post(url, null, options);
  }
  public saveNewDocument(docType: string, newData: any): Observable<any> {


    // Set the headers for JSON content type
    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    // Define your request options, including headers and body
    const httpOptions = {
      headers: headers
    };

    const url = this.baseurl + 'Documentation/New' + docType;
    return this.http.post(url, newData, httpOptions);
  }
  public saveRepoDetails(counterparty: string, entity: string, repoData: any) {
    const url = this.baseurl + 'CounterpartyDetails/SaveRepoDetails?counterparty=' + counterparty + '&entity=' + entity;
    return this.http.post(url, repoData);
  }
  public saveRatingsEvent(ratingsEvent: any) {
    const url = this.baseurl + 'CounterpartyDetails/SaveRatingsEvent';
    return this.http.post(url, ratingsEvent);
  }
  public saveHaircut(rawHaircut: any, haircutType: string) {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });
    const httpOptions = {
      headers: headers
    };
    let url;
    if (haircutType === 'Repo')
      url = this.baseurl + 'CounterpartyDetails/SaveRepoHaircut';
    else
      url = this.baseurl + 'ReferenceData/SaveHaircut';
    return this.http.post(url, rawHaircut, httpOptions);
  }

  public saveDeliveryInstructions(counterparty: string, entity: string, instructions: any) {
    const url = this.baseurl + 'SaveDeliveryInstructions?counterparty=' + counterparty + '&entity=' + entity;
    return this.http.post(url, instructions);
  }
  public deleteContacts(counterparty: string, entity: string, contact: any) {
    const requestBody = contact;
    // Using HttpHeaders to set Content-Type to 'application/json' if needed
    const headers = new HttpHeaders().set('Content-Type', 'application/json');
    const url = this.baseurl + 'CounterpartyDetails/Contacts?counterparty=' + counterparty + '&entity=' + entity;
    return this.http.delete(url, { body: requestBody, headers });
  }
  public deleteNotificationTimes(counterparty: string, entity: string, NotificationTimes: any) {
    const requestBody = NotificationTimes;
    // Using HttpHeaders to set Content-Type to 'application/json' if needed
    const headers = new HttpHeaders().set('Content-Type', 'application/json');
    const url = this.baseurl + 'CounterpartyDetails/NotificationTimes?counterparty=' + counterparty + '&entity=' + entity;
    return this.http.delete(url, { body: requestBody, headers });
  }
  public deleteEligibleAssets(counterparty: string, entity: string, EligibleAssets: any) {
    const requestBody = EligibleAssets;
    // Using HttpHeaders to set Content-Type to 'application/json' if needed
    const headers = new HttpHeaders().set('Content-Type', 'application/json');
    const url = this.baseurl + 'CounterpartyDetails/EligibleAssets?counterparty=' + counterparty + '&entity=' + entity;
    return this.http.delete(url, { body: requestBody, headers });
  }
  public saveContacts(counterparty: string, Contacts: any) {
    const url = this.baseurl + 'SaveContacts?counterparty=' + counterparty;
    return this.http.post(url, Contacts);
  }
  public saveNotificationTimes(notificationTimes: any) {
    const url = this.baseurl + 'CounterpartyDetails/SaveNotificationTimes';
    return this.http.post(url, notificationTimes);
  }
  public saveEligibleCollateral(counterparty: string, entity: string, eligibleCollateral: any) {
    const url = this.baseurl + 'SaveEligibleCollateral?counterparty=' + counterparty + '&entity=' + entity;
    return this.http.post(url, eligibleCollateral);
  }
  public saveAuthorizedProducts(counterparty: string, entity: string, authorizedProducts: any) {
    const url = this.baseurl + 'CounterpartyDetails/SaveAuthorizedProducts?counterparty=' + counterparty + '&entity=' + entity;
    return this.http.post(url, authorizedProducts);
  }
  /**
   * Deletes haircut records from the database.
   * 
   * Note: Using HTTP DELETE with request body is supported by the backend API.
   * The API endpoint is designed to accept [FromBody] List<HaircutModel> with DELETE method.
   * While some proxies may not support DELETE with body, this implementation aligns
   * with the backend contract and RESTful semantics for bulk deletion operations.
   * 
   * @param haircutData - Array of haircut records to delete
   * @returns Observable that completes when deletion is successful
   */
  public deleteHaircut(haircutData: any[]): Observable<any> {
    const headers = new HttpHeaders().set('Content-Type', 'application/json');
    const url = `${this.baseurl}ReferenceData/DeleteHaircut`;
    return this.http.delete(url, { body: haircutData, headers });
  }
}
