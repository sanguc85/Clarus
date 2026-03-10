import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IgxsharedModule } from 'src/app/shared/igxshared/igxshared.module';
import { CommentdialogModule } from '../commentdialog/commentdialog.module';
import { ReportsRoutingModule } from './reports-routing.module';
import { ReportsComponent } from './reports.component';

@NgModule({
  declarations: [ReportsComponent],
  imports: [CommonModule, IgxsharedModule, ReportsRoutingModule, FormsModule, ReactiveFormsModule, CommentdialogModule],
})
export class ReportsModule {}
