import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class HaircutService {

  public baseurl: string;

  constructor(private http: HttpClient) {
    this.baseurl = environment.DataServiceApiUrl;
  }

  getHaircutData(type: string): Observable<any> {
    const url = this.baseurl + "GetAllHaircut?haircutType=" + type;
    return this.http.get(url);
  }

}
