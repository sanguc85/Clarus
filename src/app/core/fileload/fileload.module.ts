import { NgModule } from '@angular/core';
import { FormsModule,ReactiveFormsModule  } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { FileloadComponent } from './fileload.component';
import { FileloadRoutingModule } from './fileload-routing.module';
import { IgxsharedModule } from 'src/app/shared/igxshared/igxshared.module';

@NgModule({
  declarations: [FileloadComponent],
  imports: [
    CommonModule, IgxsharedModule, FileloadRoutingModule,
    FormsModule,ReactiveFormsModule
  ]
})
export class FileloadModule { }
