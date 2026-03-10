import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AzureOidcCoreService } from '../azure-oidc/azure-oidc-core.service';

@Component({
  selector: 'app-azure-oidc-core-callback',
  templateUrl: './azure-oidc-core-callback.component.html',
})
export class AzureOidcCoreCallbackComponent implements OnInit {
  constructor(
    readonly azureOidc: AzureOidcCoreService,
    readonly router: Router
  ) {}

  ngOnInit() {
    //get value from "ClarusCallBackUrl" cookie and redirect to that page
    this.azureOidc.completeAuthentication();
    // Retrieve the value from "ClarusCallBackUrl" cookie
    var redirectURL = this.azureOidc.getCookie('ClarusCallBackUrl');

    if ( redirectURL === null || redirectURL === undefined || redirectURL === '' ) {
      redirectURL = '/DailyMargin';
    }
    this.router.navigateByUrl(redirectURL);
  }
}
