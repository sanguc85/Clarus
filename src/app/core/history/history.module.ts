import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HistoryRoutingModule } from './history-routing.module';

import { IgxsharedModule } from 'src/app/shared/igxshared/igxshared.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DailymargingridComponent } from './tabs/dailymargingrid/dailymargingrid.component';
import { HistoryComponent } from './history.component';
import { CollateralmovementgridComponent } from './tabs/collateralmovementgrid/collateralmovementgrid.component';
import { CollateralbalancegridComponent } from './tabs/collateralbalancegrid/collateralbalancegrid.component';
import { ReferencedatagridComponent } from './tabs/referencedatagrid/referencedatagrid.component';
import { CounterpartygridComponent } from './tabs/counterpartygrid/counterpartygrid.component';
import { EntitygridComponent } from './tabs/entitygrid/entitygrid.component';
import { IsdagridComponent } from './tabs/isdagrid/isdagrid.component';
import { CsagridComponent } from './tabs/csagrid/csagrid.component';
import { McagridComponent } from './tabs/mcagrid/mcagrid.component';
import { UseraccessgridComponent } from './tabs/useraccessgrid/useraccessgrid.component';
import { UserrolesgridComponent } from './tabs/userrolesgrid/userrolesgrid.component';
import { RulesgridComponent } from './tabs/rulesgrid/rulesgrid.component';
import { SharedpipesModule } from 'src/app/shared/sharedpipes/sharedpipes.module';
import { MonthlyinterestgridComponent } from './tabs/monthlyinterestgrid/monthlyinterestgrid.component';
import { FileloadgridComponent } from './tabs/fileloadgrid/fileloadgrid.component';



@NgModule({
  declarations: [
    DailymargingridComponent, HistoryComponent, CollateralmovementgridComponent, CollateralbalancegridComponent, ReferencedatagridComponent, CounterpartygridComponent, EntitygridComponent, IsdagridComponent, CsagridComponent,
    McagridComponent, UseraccessgridComponent, UserrolesgridComponent, RulesgridComponent, MonthlyinterestgridComponent, FileloadgridComponent
  ],
  imports: [
    CommonModule,
    HistoryRoutingModule, IgxsharedModule, FormsModule, ReactiveFormsModule
    , SharedpipesModule  ]
})
export class HistoryModule { }
