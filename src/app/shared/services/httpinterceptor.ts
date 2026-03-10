import {
  HttpEvent, HttpHandler, HttpHeaders, HttpInterceptor, HttpRequest
} from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { CustomErrorHandler } from './error-handler.service';
import { ToasterService } from './toaster.service';
import { AzureOidcCoreService } from 'src/app/azure-oidc/azure-oidc-core.service';


@Injectable()
export class WinAuthInterceptor implements HttpInterceptor {
  constructor(
    readonly toasterService: ToasterService,
    readonly errorHandler: CustomErrorHandler,
    readonly oidcService: AzureOidcCoreService
  ) { }
  intercept(
    req: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    if (this.oidcService.isLoggedIn()) {

      var token = this.oidcService.userSubject.value?.access_token;
      let headers = new HttpHeaders();
      headers = headers.set('Authorization', 'Bearer ' + token);
      const authHeader = headers.get('Authorization');
      if (req.body instanceof FormData) {
        req = req.clone({
          //withCredentials: true,
          headers: new HttpHeaders({
            Authorization: authHeader ? authHeader : '',
          }),
        });        
      }
      else {
        req = req.clone({
          //withCredentials: true,
          headers: new HttpHeaders({
            'Content-Type': 'application/json',
            Authorization: authHeader ? authHeader : '',
          }),
        });
      }
      return next.handle(req).pipe(
        tap(
          (event: any) => {
            if (event.ok === true) {
            }
          },
          (error) => {
            this.errorHandler.handleHttpError(error);
            this.errorHandler.setIsError(true);
          }
        )
      );
    } else {
      this.errorHandler.setIsError(true);
      return next.handle(req);
    }
  }
}
