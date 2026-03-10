import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SubstitutionComponent } from './substitution.component';
import { RouterModule, Routes } from '@angular/router';


const routes: Routes = [
  {
    path: '',
    component: SubstitutionComponent,
  }
];
@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SubstitutionRoutingModule { }
