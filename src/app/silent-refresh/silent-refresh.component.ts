import { Component, OnInit } from '@angular/core';
import { AzureOidcCoreService } from '../azure-oidc/azure-oidc-core.service';
import { Location } from '@angular/common';
import { CustomErrorHandler } from '../shared/services/error-handler.service';

@Component({
  selector: 'app-silent-refresh',
  templateUrl: './silent-refresh.component.html',
  styleUrls: ['./silent-refresh.component.scss'],
})
export class SilentRefreshComponent implements OnInit {
  constructor(
    private oAuthService: AzureOidcCoreService,
    readonly errorHandler: CustomErrorHandler
  ) {}

  ngOnInit(): void {
    this.signinSilent();
  }

  signinSilent() {
    this.oAuthService
      .signinSilentCallback()
      .then((response: any) => {
        console.log(response);
      })
      .catch((err: any) => {
        this.errorHandler.appendMessageToErrorList(err);
        this.errorHandler.setIsError(true);
      });
  }
}
