import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FileloadComponent } from './fileload.component';
import { RouterModule, Routes } from '@angular/router';


const routes: Routes = [
  {
    path: '',
    component: FileloadComponent,
  }
];
@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class FileloadRoutingModule { }
