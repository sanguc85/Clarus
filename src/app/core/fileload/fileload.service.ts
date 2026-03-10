import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { AzureOidcCoreService } from 'src/app/azure-oidc/azure-oidc-core.service';

@Injectable({
  providedIn: 'root'
})
export class FileloadService {

  public baseurl: string;
  public loadurl: string;
  constructor(private http: HttpClient,
    readonly azureOidcCore: AzureOidcCoreService) {
    this.baseurl = environment.DataServiceApiUrl;
    this.loadurl = environment.LoaderApiUrl;
  }
  public getData(dataDate:string):Observable<any>{
    const url = this.baseurl + 'FileLoad/GetCounterpartyFileLoadStatus?dataDate=' + dataDate;
    return this.http.get(url);
  }
  public getAllFileLoadStatus(dataDate:string):Observable<any>{
    const url = this.baseurl + 'FileLoad/GetAllFileLoadStatus?dataDate=' + dataDate;
    return this.http.get(url);
  }
  public getFileLoadStatus(dataDate:string):Observable<any>{
    const url = this.baseurl + 'FileLoad/GetFileLoadStatus?dataDate=' + dataDate;
    return this.http.get(url);
  }
  public loadData(dataDate:string,loaderType:string, parameters:any)  {    
    const url = this.baseurl + 'Load/' + loaderType + '?dataDate=' + dataDate;
    return this.http.post(url, parameters);
  }
  public loadSecurityPrices(dataDate:string)  {
    let parameters:any=[dataDate];
    const url = this.baseurl + 'Load/SecurityPrices?dataDate=' + dataDate;
    return this.http.post(url, parameters);
  }
  public loadVLDT(dataDate:string,entity:string)  {
    let parameters:any=[dataDate,entity];
    const url = this.baseurl + 'Load/VLDT?dataDate=' + dataDate;
    return this.http.post(url, parameters);
  }
  public loadBaseRates(dataDate:string,rateName:string)  {
    let parameters:any=[dataDate,rateName];
    const url = this.baseurl + 'Load/BaseRates?dataDate=' + dataDate;
    return this.http.post(url, parameters);
  }
  public uploadFiles(dataDate: string,counterparty:string,loadType:string, data: FormData): Observable<any> {
    
    const url =
    this.baseurl + 'FileLoad/UploadFile?dataDate=' + dataDate + '&counterparty=' + counterparty +'&loadType='+ loadType;
    return this.http.post(url, data);
  }
  public uploadFile(dataDate: string,counterparty:string,entity:string,loadType:string, formdata: FormData,comments:string): Observable<any> {
    
    const formData = new FormData();
    formdata.getAll('file').forEach(file => formData.append('file', file)); // Fix: Iterate over the array of files and append each file individually
    formData.append('comments', comments);
    const url = this.loadurl + 'clarusloader/Upload/' + dataDate + '/' + counterparty + '/' + entity + '/' + loadType;
    return this.http.post(url, formData);
    
  }
  public loadFiles(dataDate: string,counterparty:string,entity:string,loadType:string,comments:string): Observable<any> {
    let data:any;
    if(entity=="SBLIC")
      data={"DataDate":dataDate,"Name":loadType,"Counterparties":counterparty,"Comments":comments,"Delete":true,"SendEmail":true};
    else
      data={"DataDate":dataDate,"Name":loadType,"Counterparties":counterparty,"Entity":entity,"Comments":comments,"Delete":true,"SendEmail":true};

    const url = this.loadurl + 'clarusloader/load';
    return this.http.post(url, data);
  }
  public setMetaDataTableList(metaDataTables:string[]){
    const url=this.baseurl+'ReferenceData/GetRefenceDataTables';
    return this.http.get(url, {
      params: { tableNames: metaDataTables },
    });
  }

}
