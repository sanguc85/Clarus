import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class EntitydetailsService {

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

  public getEntitySummary(entity: string): Observable<any> {
    const url = this.baseurl + 'EntityDetails/GetEntitySummary?entity=' + entity;
    return this.http.get(url);
  }

  public addNewEntity(newEntityData: any): Observable<any> {
    const url = this.baseurl + 'EntityDetails/AddNew';
    return this.http.post(url, newEntityData);
  }

  public getEntityDetails(entity: string, counterparty: string): Observable<any> {
    const url = this.baseurl + 'EntityDetails/GetEntityDetails?entity=' + entity + '&counterparty=' + counterparty;
    return this.http.get(url);
  }

  public getSettlementPosition(): Observable<any> {
    const url = this.baseurl + 'Position/GetSettlementPosition';
    return this.http.get(url);
  }

  public addNewPosition(data: any): Observable<any> {
    const url = this.baseurl + 'Position/SaveSettlementPosition';
    return this.http.post(url, data);
  }

  public getSettlementAccount(): Observable<any> {
    const url = this.baseurl + 'Account/GetSettlementAccount';
    return this.http.get(url);
  }

  public addNewAccount(data: any): Observable<any> {
    const url = this.baseurl + 'Account/SaveSettlementAccount';
    return this.http.post(url, data);
  }

  public getRatingsTable(entity: string): Observable<any> {
    const url = this.baseurl + 'GetRatingsTable?entity=' + entity;
    return this.http.get(url);
  }

  public saveData(data: any): Observable<any> {
    const url = this.baseurl + 'EntityDetails/SaveData';
    return this.http.post(url, data);
  }

  public saveDeliveryInstructions(instructions: any, entity: string): Observable<any> {
    const url = this.baseurl + 'SaveDeliveryInstructions?entity=' + entity;
    return this.http.post(url, instructions);
  }

  public getDeliveryInstructions(entity: string): Observable<any> {
    const url = this.baseurl + 'GetEntityDeliveryInstructions?entity=' + entity;
    return this.http.get(url);
  }

  public getEntityContacts(entity: string): Observable<any> {
    const url = this.baseurl + 'GetEntityContacts?entity=' + entity;
    return this.http.get(url);
  }

  public saveContacts(contacts: any[], entity: string): Observable<any> {
    const url = this.baseurl + 'SaveContacts?entity=' + entity;
    return this.http.post(url, contacts);
  }

}
