import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class BenchmarkdataService {
  public baseurl: string;

  constructor(private http: HttpClient) {
    this.baseurl = environment.DataServiceApiUrl;
  }

  getBenchmarkData(startDate: string, endDate: string, rateNames: string[]): Observable<any> {
    let params = new HttpParams()
      .set('startDate', startDate)
      .set('endDate', endDate)
      ;
    // Append each rateName individually to the params
    rateNames.forEach((rateName) => {
      params = params.append('rateName', rateName);
    });
    const url = this.baseurl + 'ReferenceData/GetBenchmarkData';
    return this.http.get(url, { params });
  }

  saveNewBaseRate(data: any): Observable<any> {
    const url = this.baseurl + 'ReferenceData/SaveNewBaseRate';
    return this.http.post(url, data);
  }
}