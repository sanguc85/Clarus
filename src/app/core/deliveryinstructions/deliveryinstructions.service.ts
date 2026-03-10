import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class DeliveryinstructionsService {
  public baseurl: string;
  public loadurl: string;
  constructor(private http: HttpClient) {
    this.baseurl = environment.DataServiceApiUrl;
    this.loadurl = environment.LoaderApiUrl;
  }

  public getSettlementPosition(): Observable<any> {
    const url = this.baseurl + 'Position/GetSettlementPosition';
    return this.http.get(url);
  }

  public addNewPosition(data: any): Observable<any> {
    const url = this.baseurl + 'Position/SaveSettlementPosition';
    return this.http.post(url, data);
  }

  public getSettlementAccountByEntity(entity: string): Observable<any> {
    const url = this.baseurl + 'Account/GetSettlementAccountbyEntity?entity=' + entity;
    return this.http.get(url);
  }

  public addNewAccount(data: any): Observable<any> {
    const url = this.baseurl + 'Account/SaveSettlementAccount';
    return this.http.post(url, data);
  }

    public saveSettlementDeliveryInstructions(id: number,data: any): Observable<any> {
    const url = this.baseurl + 'DeliveryInstruction/SaveSettlementDeliveryInstructions?id=' + id + '&data=' + data;
    // const payload = { data: data, id: id };
    return this.http.post(url, data);
  }

  public addNewSettlementDeliveryInstructions(instructions: any): Observable<any> {
    const url = this.baseurl + 'DeliveryInstruction/SaveSettlementDeliveryInstructions';
    return this.http.post(url, instructions);
  }

  public getSettlementDeliveryInstructionByAccount(entity: string | null, counterparty: string | null, account: string): Observable<any> {
    let url = this.baseurl + 'DeliveryInstruction/GetSettlementDeliveryInstructionsbyAccount?account=' + account;
    if (entity) {
      url += '&entity=' + entity;
    }

    if (counterparty) {
      url += '&counterparty=' + counterparty;
    }
    return this.http.get(url);
  }

  public getSettlementDeliveryInstructionByCp(counterparty: string) {
    const url = this.baseurl + 'DeliveryInstruction/GetSettlementDeliveryInstructionsbyCp?counterparty=' + counterparty;
    return this.http.get(url);
  }

  public setMetaDataTableList(metaDataTables: string[]) {
    const url = this.baseurl + 'ReferenceData/GetRefenceDataTables';
    return this.http.get(url, {
      params: { tableNames: metaDataTables },
    });
  }
}
