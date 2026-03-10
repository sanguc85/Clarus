import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class RulesMetadataService {
  public baseurl: string;

  constructor(private http: HttpClient) {
    this.baseurl = environment.DataServiceApiUrl;
  }

  getRules(): Observable<any> {
    const url = this.baseurl + 'ReferenceData/Rules';
    return this.http.get(url);
  }

  saveRules(editedCells: any[], newRows: any[], deletedRows: any[]): Observable<any> {
    const data = {
      EditedData: editedCells,
      NewData: newRows,
      DeletedData: deletedRows,
    };
    const url = this.baseurl + 'ReferenceData/Rules';
    return this.http.post(url, data);
  }
}
