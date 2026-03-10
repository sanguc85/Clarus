import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class ValuationdataService {
  public baseurl: string;

  constructor(private http: HttpClient) {
    this.baseurl = environment.DataServiceApiUrl;
  }

  getValuationData(Date: string): Observable<any> {
    const url = this.baseurl + 'ReferenceData/GetValuationData?dataDate=' + Date;
    return this.http.get(url);
  }
}