import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { HistoryComponent } from './history.component';
import { DailymargingridComponent } from './tabs/dailymargingrid/dailymargingrid.component';
import { CollateralmovementgridComponent } from './tabs/collateralmovementgrid/collateralmovementgrid.component';
import { CollateralbalancegridComponent } from './tabs/collateralbalancegrid/collateralbalancegrid.component';
import { ReferencedatagridComponent } from './tabs/referencedatagrid/referencedatagrid.component';
import { CounterpartygridComponent } from './tabs/counterpartygrid/counterpartygrid.component';
import { CsagridComponent } from './tabs/csagrid/csagrid.component';
import { EntitygridComponent } from './tabs/entitygrid/entitygrid.component';
import { IsdagridComponent } from './tabs/isdagrid/isdagrid.component';
import { McagridComponent } from './tabs/mcagrid/mcagrid.component';
import { RulesgridComponent } from './tabs/rulesgrid/rulesgrid.component';
import { UseraccessgridComponent } from './tabs/useraccessgrid/useraccessgrid.component';
import { UserrolesgridComponent } from './tabs/userrolesgrid/userrolesgrid.component';
import { MonthlyinterestgridComponent } from './tabs/monthlyinterestgrid/monthlyinterestgrid.component';
import { FileloadgridComponent } from './tabs/fileloadgrid/fileloadgrid.component';
const routes: Routes = [
  {
    path: '',
    component: HistoryComponent,
    children: [
      { path: '', component: DailymargingridComponent, pathMatch: 'full' },
      { path: 'daily-margin', component: DailymargingridComponent },
      { path: 'monthlyinterestsummary', component: MonthlyinterestgridComponent },
      { path: 'collateral-movements', component: CollateralmovementgridComponent },
      { path: 'collateral-balance', component: CollateralbalancegridComponent },
      { path: 'reference-data', component: ReferencedatagridComponent },
      { path: 'counterparty', component: CounterpartygridComponent },
      { path: 'entity', component: EntitygridComponent },
      { path: 'fileload', component: FileloadgridComponent },
      { path: 'isda', component: IsdagridComponent },
      { path: 'csa', component: CsagridComponent },
      { path: 'mca', component: McagridComponent },
      { path: 'user-access', component: UseraccessgridComponent },
      { path: 'user-roles', component: UserrolesgridComponent },
      { path: 'rules', component: RulesgridComponent }
    ]
},

];


@NgModule({
  declarations: [],
  imports: [
    CommonModule, RouterModule.forChild(routes)
  ],
  exports: [RouterModule]
})
export class HistoryRoutingModule { }

