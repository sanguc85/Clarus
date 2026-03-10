import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MonthlyinterestComponent } from './monthlyinterest.component';
import { RouterModule, Routes } from '@angular/router';
const routes: Routes = [
  {
    path: '',
    component: MonthlyinterestComponent,
  }
];
@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class MonthlyinterestRoutingModule { }
