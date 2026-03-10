import { UserManagerSettings } from 'oidc-client';

export interface RefreshTokenSettings extends UserManagerSettings {
  resource: string;
}
