import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class MetadataMetadataService {
  public baseurl: string;

  constructor(private http: HttpClient) {
    this.baseurl = environment.DataServiceApiUrl;
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

  saveData(referenceTable: string,editedCells: any[],newRows: any[], deletedRows: any[]): Observable<any> {
    const dataDict = {
      TableName: referenceTable,
      EditedData: editedCells,
      NewData: newRows,
      DeletedData: deletedRows
    };

    const url = this.baseurl + 'ReferenceData/SaveData';
    return this.http.post(url, dataDict);
  }

  saveAccount(editedCells: any[], newRows: any[], deletedRows: any[]): Observable<any> {
  const url = this.baseurl + 'ReferenceData/SaveAccount';
  const body = {
    EditedData: editedCells,      
    NewData: newRows,             
    DeletedData: deletedRows      
  };
  return this.http.post<any>(url, body);
  }

  getEntityNames(): Observable<string[]> {
  const url = this.baseurl + 'ReferenceData/GetRefenceData?tableName=Entity';
  return this.http.get<any[]>(url).pipe(
    map(rows => (rows || []).map(r => r.Name))
  );
}

  getPositionNames(): Observable<string[]> {
  const url = this.baseurl + 'Position/GetSettlementPosition';
  return this.http.get<any[]>(url).pipe(
    map(rows =>
      (rows || [])
        .filter(r => r?.IsActive === true)
        .map(r => r?.Name)
    )
  );
}

savePosition(editedCells: any[], newRows: any[], deletedRows: any[]): Observable<any> {
  const url = this.baseurl + 'ReferenceData/SavePosition';
  const body = {
    EditedData: editedCells,
    NewData: newRows,
    DeletedData: deletedRows
  };
  return this.http.post<any>(url, body);
}


}