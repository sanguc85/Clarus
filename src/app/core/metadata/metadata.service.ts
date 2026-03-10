import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class MetadataService {
  public baseurl: string;
  public isAdmin: boolean = false;
  public isMO: boolean = false;

  constructor(private http: HttpClient) {
    this.baseurl = environment.DataServiceApiUrl;
    this.getUserRole();
  }

  getReferenceData(referenceTable: string): Observable<any[]> {
    const url =
      this.baseurl + 'ReferenceData/GetRefenceData?tableName=' + referenceTable;
    return this.http.get<any[]>(url);
  }

  getReferenceTableList(): Observable<any> {
    const url = this.baseurl + 'ReferenceData/GetReferenceTableList';
    return this.http.get(url);
  }

  getUserRole(): Observable<any> {
    const url = this.baseurl + 'UserAccess/GetRole';
    return this.http.get<any>(url).pipe(
      tap((data) => {
        if (data.includes('ADMIN')) {
          this.isAdmin = true;
        } else if (data.includes('MO')) {
          this.isMO = true; // Set isMO property to true if user is MO
        } else {
          this.isAdmin = false;
          this.isMO = false;
        }
      })
    );
  }
}
