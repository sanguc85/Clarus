import { NgModule, NO_ERRORS_SCHEMA } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserModule, HammerGestureConfig, HAMMER_GESTURE_CONFIG } from '@angular/platform-browser';
import { IgxToastModule, IgxProgressBarModule } from '@infragistics/igniteui-angular';
import { IgxsharedModule } from './shared/igxshared/igxshared.module';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { IgxExcelExporterService, IgxGridModule } from 'igniteui-angular';
import { NavComponent } from './core/nav/nav.component';
import { DateService } from './shared/services/dateService';
import { DatePipe, CommonModule } from '@angular/common';
import { CustomErrorHandler } from './shared/services/error-handler.service';
import { ToasterService } from './shared/services/toaster.service';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { WinAuthInterceptor } from './shared/services/httpinterceptor';
import { MatPaginatorModule } from '@angular/material/paginator';
import { DailymarginModule } from './core/dailymargin/dailymargin.module';
import { SubstitutionModule } from './core/substitution/substitution.module';
import { MonthlyinterestModule } from './core/monthlyinterest/monthlyinterest.module';
import { FileloadModule } from './core/fileload/fileload.module';
import { CollateralmovementModule } from './core/collateralmovement/collateralmovement.module';
import { CounterpartydetailsModule } from './core/counterpartydetails/counterpartydetails.module';
import { CounterpartyCollateralModule } from './core/counterpartycollateral/counterpartycollateral.module';
import { AzureOidcCoreCallbackComponent } from './azure-oidc-callback/azure-oidc-core-callback.component';
import { SilentRefreshComponent } from './silent-refresh/silent-refresh.component';
import { AzureOidcCoreService } from './azure-oidc/azure-oidc-core.service';
import { AzureOidcCoreGuardService } from './azure-oidc/azure-oidc-core.guard';
@NgModule({
  declarations: [
    AppComponent,
    NavComponent,
    AzureOidcCoreCallbackComponent,
    SilentRefreshComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    CommonModule,
    ReactiveFormsModule,
    IgxGridModule,
    IgxsharedModule,
    BrowserAnimationsModule,
    HttpClientModule,
    MatPaginatorModule,
    DailymarginModule,
    IgxToastModule,
    IgxProgressBarModule,
    SubstitutionModule,
    MonthlyinterestModule,
    CollateralmovementModule,
    FileloadModule,
    CounterpartydetailsModule,
    CounterpartyCollateralModule,
  ],
  providers: [
    DateService,
    {
      provide: HTTP_INTERCEPTORS,
      useClass: WinAuthInterceptor,
      multi: true,
    },
    DatePipe,
    IgxExcelExporterService,
    CustomErrorHandler,
    ToasterService,
    AzureOidcCoreService,
    AzureOidcCoreGuardService
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
