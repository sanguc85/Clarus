import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DailymarginComponent } from './dailymargin.component';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: '',
    component: DailymarginComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class DailymarginRoutingModule { }
