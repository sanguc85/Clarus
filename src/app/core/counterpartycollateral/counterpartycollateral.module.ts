import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CounterpartycollateralComponent } from './counterpartycollateral.component';
import { CounterpartycollateralRoutingModule } from './counterpartycollateral-routing.module';
import { IgxsharedModule } from 'src/app/shared/igxshared/igxshared.module';
import { SharedpipesModule } from '../../shared/sharedpipes/sharedpipes.module';

@NgModule({
  declarations: [CounterpartycollateralComponent],
  imports: [CounterpartycollateralRoutingModule, IgxsharedModule, CommonModule, SharedpipesModule],
})
export class CounterpartyCollateralModule {}
