import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CounterpartydetailsComponent } from './counterpartydetails.component';
import { RouterModule, Routes } from '@angular/router';


const routes: Routes = [
  {
    path: '',
    component: CounterpartydetailsComponent,
  }
];
@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CounterpartydetailsRoutingModule { }
