import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CounterpartycollateralComponent } from './counterpartycollateral.component';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: '',
    component: CounterpartycollateralComponent,
  },
];
@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CounterpartycollateralRoutingModule {}
