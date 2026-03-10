import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class HistoryService {

  public baseurl: string;

  constructor(private http: HttpClient) {
    this.baseurl = environment.DataServiceApiUrl;
  }

  getAuditData(startDate: Date, endDate: Date, auditTable: string): Observable<any> {
    const url = this.baseurl + "Audit/GetAuditData?startDate=" + startDate + "&endDate=" + endDate + '&auditTable=' + auditTable;
    return this.http.get(url);
  }

  getAudit(startDate: Date, endDate: Date, auditTable: string): Observable<any> {
    const url = this.baseurl + "Audit/" + auditTable + "?startDate=" + startDate + "&endDate=" + endDate + '&tableName=' + auditTable;
    return this.http.get(url);
  }
}
