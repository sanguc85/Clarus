import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class CounterpartycollateralService {
  public baseurl: string;

  constructor(private http: HttpClient) {
    this.baseurl = environment.DataServiceApiUrl;
  }

  public getCollateralDetails(dataDate: string, counterparty?: string, entity?: string): Observable<any> {
    var url = this.baseurl + 'CounterpartyCollateral/GetCollateral?dataDate=' + dataDate;
    if (counterparty) {
      url += '&counterparty=' + counterparty;
    }
    if (entity) {
      url += '&entity=' + entity;
    }
    return this.http.get(url);
  }

  public getExposureData(dataDate: string, counterparty?: string, entity?: string): Observable<any> {
    var url = this.baseurl + 'CounterpartyCollateral/GetExposure?dataDate=' + dataDate;
    if (counterparty) {
      url += '&counterparty=' + counterparty;
    }
    if (entity) {
      url += '&entity=' + entity;
    }
    return this.http.get(url);
  }
  public setMetaDataTableList(metaDataTables: string[]) {
    const url = this.baseurl + 'ReferenceData/GetRefenceDataTables';
    return this.http.get(url, {
      params: { tableNames: metaDataTables },
    });
  }
}
