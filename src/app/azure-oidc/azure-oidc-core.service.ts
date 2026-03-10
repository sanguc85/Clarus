import { Injectable, Output } from '@angular/core';
import { environment } from 'src/environments/environment';
import { UserManager, User } from 'oidc-client';
import { BehaviorSubject, Observable, Subject, map } from 'rxjs';
import { RefreshTokenSettings } from '../silent-refresh/RefreshTokenSettings';

@Injectable()
export class AzureOidcCoreService {
  private manager = new UserManager(this.getClientSettings());
  private user: any;
  public userNameCallBack = new Subject<string>();
  userNameCallBack$ = this.userNameCallBack.asObservable();
  public userSubject = new BehaviorSubject<User | null>(null);

  constructor() {
    this.manager.getUser().then((user: any) => {
      this.handleUserLoad(user);
    });

    this.manager.events.addUserLoaded((args: any) => {
      this.manager.getUser().then((res: any) => {
        this.handleUserLoad(res);
      });
    });
  }
  private handleUserLoad(user: any): void {
    this.user = user;
    this.setSessionStorage(user);
    this.userSubject.next(user);
    this.userNameCallBack.next(user?.profile?.name);
  }

  public getUserName() {
    return this.user !== null ? this.user.profile.unique_name : '';
  }

  public isLoggedIn(): boolean {
    const tokenData = sessionStorage.getItem('ClarusTokenData');
    if (tokenData && tokenData !== 'null') {
      try {
        const user = JSON.parse(tokenData) as User;
        if (user && user.expires_at && user.id_token) {
          const now = Math.floor(Date.now() / 1000); // current time in seconds
          return user.expires_at > now;
        }
      } catch (error) {
        console.error('Error parsing token data:', error);
        return false;
      }
    }
    return false;
  }

  private setSessionStorage(userData: any) {
    let tokenData = JSON.stringify(userData);
    sessionStorage.setItem('ClarusTokenData', tokenData);
  }

  public startAuthentication(): Promise<void> {
    return this.manager.signinRedirect();
  }

  public completeAuthentication(): Promise<void> {
    return this.manager.signinRedirectCallback().then((user: any) => {
      this.user = user;
      this.userNameCallBack.next(user.profile.name?.toString());
    });
  }

  // async refreshAccessToken(): Promise<void> {
  //   if (this.isLoggedIn()) {
  //     try {
  //       await this.manager.signinSilent();
  //       const user = await this.manager.getUser();
  //       if (user) {
  //         this.user = user;
  //         this.setSessionStorage(user);
  //         console.log('Token refreshed successfully:', user.expires_at);
  //       } else {
  //         throw new Error('User is not logged in');
  //       }
  //     } catch (error) {
  //       console.error('Error refreshing token:', error);
  //       await this.signOut();
  //       throw new Error('Failed to refresh access token');
  //     }
  //   } else {
  //     await this.signOut();
  //     throw new Error('User is not logged in');
  //   }
  // }

  signinSilentCallback(): Promise<User | undefined> {
    return this.manager.signinSilentCallback();
  }

  // checkTokenExpiry(): Observable<boolean> {
  //   return this.userSubject.pipe(
  //     map((user) => {
  //       if (!user) {
  //         return false;
  //       }
  //       const expirationDate = new Date(user.expires_at * 1000);
  //       const currentDate = new Date();
  //       const timeDifference = expirationDate.getTime() - currentDate.getTime();
  //       const timeDifferenceInMinutes = timeDifference / (1000 * 60);
  //       return timeDifferenceInMinutes <= 10; // 10 minutes before the token expires
  //     })
  //   );
  // }

  public async signOut() {
    try {
      await this.manager.signoutRedirect();
      this.deleteCookie('ClarusCallBackUrl');
      sessionStorage.removeItem('ClarusTokenData');
      this.userSubject.next(null);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  }

  private getClientSettings(): RefreshTokenSettings {
    var _tempSettings;
    var oidcSettings: RefreshTokenSettings;
    _tempSettings = environment.OidcSettings;
    _tempSettings.redirect_uri = environment.OidcSettings.core_redirect_uri;
    oidcSettings = _tempSettings;
    return oidcSettings;
  }

  public getCookie(name: string): string | null {
    const match = document.cookie.replace(
      /(?:(?:^|.*;\s*)ClarusCallBackUrl\s*=\s*([^;]*).*$)|^.*$/,
      '$1'
    );
    return match;
  }

  private deleteCookie(name: string): void {
    document.cookie = `${name}=; Max-Age=-99999999; path=/`;
  }
}
