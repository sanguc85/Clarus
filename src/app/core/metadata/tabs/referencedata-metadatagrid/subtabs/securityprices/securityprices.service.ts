import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class SecuritypricesService {
  public baseurl: string;

  constructor(private http: HttpClient) {
    this.baseurl = environment.DataServiceApiUrl;
  }

  getSecurityPricesByData(startDate: string, endDate: string,): Observable<any> {
    const url = this.baseurl + 'ReferenceData/GetSecurityPricesByDate?startDate=' + startDate + '&endDate=' + endDate;
    return this.http.get(url);
  }

  saveSecurityPrice(data: any): Observable<any> {
    const url = this.baseurl + 'ReferenceData/SaveNewSecurityPrice';
    return this.http.post(url, data);
  }

  getAllSecurityMaster() {
    const url = this.baseurl + 'ReferenceData/AllSecurityMaster';
    return this.http.get(url);
  }
}
