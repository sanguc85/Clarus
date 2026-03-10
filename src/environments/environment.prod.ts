export const environment = {
  production: true,
  DataServiceApiUrl: 'https://clarusdataservice.spyder-api.secbenefit.net/api/',
  LoaderApiUrl: 'https://clarusfileservice.spyder-api.secbenefit.net/api/v1.0/',
  oAuthSwitch: 'ON',
  OidcSettings: {
    // SB AD Details
    authority: 'https://login.microsoftonline.com/8ab849ad-327f-42bc-8950-cf82d4491bd6/',
    client_id: '41e190b4-0382-4d4f-8dac-853740320943',
    redirect_uri: '',
    core_redirect_uri: 'https://spyder.secbenefit.net/clarus/auth-callback',
    post_logout_redirect_uri: 'https://spyder.secbenefit.net/clarus',
    response_type: 'id_token token',
    scope: 'openid profile',
    filterProtocolClaims: true,
    loadUserInfo: false,
    automaticSilentRenew: true,
    silent_redirect_uri: 'https://spyder.secbenefit.net/clarus/silent-renew',
    resource: 'https://graph.microsoft.com'
  },
};
