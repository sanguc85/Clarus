import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class RatingsService {
  public baseurl: string;

  constructor(private http: HttpClient) {
    this.baseurl = environment.DataServiceApiUrl;
  }

  getRatings(): Observable<any[]> {
    const url = this.baseurl + 'GetRatingsTable?counterparty=All&entity=All';
    return this.http.get<any[]>(url);
  }

  saveRatings(ratingsData: any[]): Observable<any> {
    const url = this.baseurl + 'ReferenceData/SaveRatings';
    return this.http.post(url, ratingsData);
  }

  public setMetaDataTableList(metaDataTables: string[]) {
    const url = this.baseurl + 'ReferenceData/GetRefenceDataTables';
    return this.http.get(url, {
      params: { tableNames: metaDataTables },
    });
  }

  sendEmail(addressList: any[], dataDate: string): Observable<any> {
    const url = this.baseurl + 'ReferenceData/SendRatingsEmail?dataDate=' + dataDate;
    return this.http.post(url, addressList);
  }
}
