import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { EntitydetailsComponent } from './entitydetails.component';

const routes: Routes = [
  {
    path: '',
    component: EntitydetailsComponent,
  }
];
@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class EntitydetailsRoutingModule { }
