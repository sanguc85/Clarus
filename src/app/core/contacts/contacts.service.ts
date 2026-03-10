import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ContactsService {
  public baseurl: string;
  public loadurl: string;
  constructor(private http: HttpClient) {
    this.baseurl = environment.DataServiceApiUrl;
    this.loadurl = environment.LoaderApiUrl;
  }
  public saveContacts(contacts: any[], counterparty?: string, entity?: string): Observable<any> {
    let url = this.baseurl + 'SaveContacts';
    if (counterparty) {
      url += `?counterparty=${counterparty}`;
    } else if (entity) {
      url += `?entity=${entity}`;
    }
    return this.http.post(url, contacts);
  }

  public deleteContacts(id: number): Observable<any> {
    const url = this.baseurl + 'DeleteContacts?id=' + id;
    return this.http.post(url, id);
  }

}