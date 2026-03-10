import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class SecuritymasterService {
  public baseurl: string;

  constructor(private http: HttpClient) {
    this.baseurl = environment.DataServiceApiUrl;
  }

  getSecurityMastersData(){
    const url = this.baseurl + 'ReferenceData/GetSecurityMaster';
    return this.http.get(url);
  }

  saveSecurityMaster(securityList: any): Observable<any> {
    const url = this.baseurl + 'ReferenceData/SaveSecurityMaster';
    return this.http.post(url, securityList);
  }

  getSecurityMasterWithCounterparty(date: string): Observable<any> {
    const url = this.baseurl + 'ReferenceData/GetSecurityMasterWithCounterparty?dataDate=' + date;
    return this.http.get(url);
  }

}
