import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CollateralmovementComponent } from './collateralmovement.component';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: '',
    component: CollateralmovementComponent,
  },
];

@NgModule({
  imports: [CommonModule, RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CollateralmovementRoutingModule { }
