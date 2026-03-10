import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AzureOidcCoreCallbackComponent } from './azure-oidc-callback/azure-oidc-core-callback.component';
import { AzureOidcCoreGuardService } from './azure-oidc/azure-oidc-core.guard';
import { SilentRefreshComponent } from './silent-refresh/silent-refresh.component';
 
const routes: Routes = [
  {
    path: '',
    redirectTo: 'DailyMargin',
    pathMatch: 'full',
  },
  {
    path: 'DailyMargin',
    loadChildren: () =>
      import('./core/dailymargin/dailymargin.module').then(
        (m) => m.DailymarginModule
      ),
    canActivate: [AzureOidcCoreGuardService],
    data: { title: 'Clarus > Daily Margin' },
  },
  {
    path: 'Security',
    loadChildren: () =>
      import('./core/substitution/substitution.module').then(
        (m) => m.SubstitutionModule
      ),
    canActivate: [AzureOidcCoreGuardService],
    data: { title: 'Clarus > Security' },
  },
  {
    path: 'MonthlyInterest',
    loadChildren: () =>
      import('./core/monthlyinterest/monthlyinterest.module').then(
        (m) => m.MonthlyinterestModule
      ),
    canActivate: [AzureOidcCoreGuardService],
    data: { title: 'Clarus > Monthly Interest' },
  },
  {
    path: 'CollateralMovement',
    loadChildren: () =>
      import('./core/collateralmovement/collateralmovement.module').then(
        (m) => m.CollateralmovementModule
      ),
    canActivate: [AzureOidcCoreGuardService],
    data: { title: 'Clarus > Collateral Movement' },
  },
  {
    path: 'FileLoadStatus',
    loadChildren: () =>
      import('./core/fileload/fileload.module').then((m) => m.FileloadModule),
    canActivate: [AzureOidcCoreGuardService],
    data: { title: 'Clarus > File Load Status' },
  },
  {
    path: 'CounterpartyCollateral',
    loadChildren: () =>
      import(
        './core/counterpartycollateral/counterpartycollateral.module'
      ).then((m) => m.CounterpartyCollateralModule),
    canActivate: [AzureOidcCoreGuardService],
    data: { title: 'Clarus > Counterparty Collateral' },
  },
  {
    path: 'EntityDetails',
    loadChildren: () =>
      import('./core/entitydetails/entitydetails.module').then(
        (m) => m.EntitydetailsModule
      ),
    data: { title: 'Clarus > Entity Details' },
    canActivate: [AzureOidcCoreGuardService],
  },
  {
    path: 'Reports',
    loadChildren: () =>
      import('./core/reports/reports.module').then((m) => m.ReportsModule),
    data: { title: 'Clarus > Reports' },
    canActivate: [AzureOidcCoreGuardService],
  },
  {
    path: 'CounterpartyDetails',
    loadChildren: () =>
      import('./core/counterpartydetails/counterpartydetails.module').then(
        (m) => m.CounterpartydetailsModule
      ),
    canActivate: [AzureOidcCoreGuardService],
    data: { title: 'Clarus > Counterparty Details' },
  },
  {
    path: 'History',
    loadChildren: () =>
      import('./core/history/history.module').then((m) => m.HistoryModule),
    data: { title: 'Clarus > Audit' },
    canActivate: [AzureOidcCoreGuardService],
  },
  {
    path: 'MetaData',
    loadChildren: () =>
      import('./core/metadata/metadata.module').then((m) => m.MetadataModule),
    data: { title: 'Clarus > MetaData' },
    canActivate: [AzureOidcCoreGuardService],
  },
  {
    path: 'auth-callback',
    component: AzureOidcCoreCallbackComponent,
  },
  {
    path: 'silent-renew',
    component: SilentRefreshComponent,
  },
  {
    path: '**',
    redirectTo: '/DailyMargin', // Redirect to DailyMargin if the route is not found
  }
];
 
@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [
    RouterModule
  ],
})
export class AppRoutingModule {}