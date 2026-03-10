import { Injectable } from '@angular/core';
import { CanActivate, CanActivateChild } from '@angular/router';
import { Location } from '@angular/common';
import { AzureOidcCoreService } from './azure-oidc-core.service';
import { environment } from 'src/environments/environment';


// TODO use route: ActivatedRouteSnapshot, state: RouterStateSnapshot to navigate user fi they are not authenticated
@Injectable()
export class AzureOidcCoreGuardService
  implements CanActivate, CanActivateChild
{
  constructor(
    readonly azureOidc: AzureOidcCoreService,
    private location: Location
  ) {}

  public canActivate(): boolean {
    if (environment.oAuthSwitch.toUpperCase() === 'OFF') return true;
    if (this.azureOidc.isLoggedIn()) {
      return true;
    }
    const currentPath = this.location.path();
    const storedCallbackUrl = this.azureOidc.getCookie('ClarusCallBackUrl');

    // Set the cookie if it doesn't exist or if the current path is different from the stored value
    if (
      (!storedCallbackUrl || currentPath !== storedCallbackUrl) &&
      currentPath !== '/auth-callback'
    ) {
      document.cookie = `ClarusCallBackUrl=${currentPath}; path=/`;
    }

    this.azureOidc.startAuthentication();
    return false;
  }

  public canActivateChild(): boolean {
    if (this.azureOidc.isLoggedIn()) {
      return true;
    }

    this.azureOidc.startAuthentication();
    return false;
  }
}
