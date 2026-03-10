export const environment = {
  production: false,
  DataServiceApiUrl: 'https://clarusdataservice.spyderqa-api.secbenefit.net/api/',
  LoaderApiUrl: 'https://clarusfileservice.spyderqa-api.secbenefit.net/api/v1.0/',
  oAuthSwitch: 'ON',
  OidcSettings: {
    // SB AD Details
    authority: 'https://login.microsoftonline.com/dc59ec9e-7561-40c2-b847-8fc1a10d47ab/',
    client_id: '9918218d-9e50-472b-b7f8-4915211b0998',
    redirect_uri: '',
    core_redirect_uri: 'https://spyderqa.secbenefit.net/clarus/auth-callback',
    post_logout_redirect_uri: 'https://spyderqa.secbenefit.net/clarus',
    response_type: 'id_token token',
    scope: 'openid profile',
    filterProtocolClaims: true,
    loadUserInfo: false,
    automaticSilentRenew: true,
    silent_redirect_uri: 'https://spyderqa.secbenefit.net/clarus/silent-renew',
    resource: 'https://graph.microsoft.com'
  },
};
