export const environment = {
  production: false,
  DataServiceApiUrl: 'http://localhost:5000/api/',
  LoaderApiUrl: 'http://localhost:5000/api/v1.0/',
  oAuthSwitch: 'ON',
  OidcSettings: {
    // SB AD Details
    authority:
      'https://login.microsoftonline.com/dc59ec9e-7561-40c2-b847-8fc1a10d47ab/',
    client_id: '31efb0d3-6b8c-4a60-a84d-6d5ae5ea7dfe',
    redirect_uri: '',
    core_redirect_uri: 'http://127.0.0.1:4200/auth-callback',
    post_logout_redirect_uri: 'http://127.0.0.1:4200',
    response_type: 'id_token token',
    scope: 'openid profile',
    filterProtocolClaims: true,
    loadUserInfo: false,
    automaticSilentRenew: true,
    silent_redirect_uri: 'http://127.0.0.1:4200/silent-renew',
    resource: 'https://graph.microsoft.com'
  },
};