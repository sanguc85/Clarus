import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class UseraccessService {
  public baseurl: string;

  constructor(private http: HttpClient) {
    this.baseurl = environment.DataServiceApiUrl;
  }

  getUsers(): Observable<any> {
    const url = this.baseurl + 'ReferenceData/Users';
    return this.http.get(url);
  }

  saveUsers(editedCells: any[],newRows: any[],deletedRows: any[]): Observable<any> {
    const data = {
      EditedData: editedCells,
      NewData: newRows,
      DeletedData: deletedRows
    };
    const url = this.baseurl + 'ReferenceData/SaveUsers';
    return this.http.post(url, data);
  }
}
