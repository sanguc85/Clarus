import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule,ReactiveFormsModule  } from '@angular/forms';
import { MonthlyinterestComponent } from './monthlyinterest.component';
import { MonthlyinterestRoutingModule } from './monthlyinterest-routing.module';
import { IgxsharedModule } from 'src/app/shared/igxshared/igxshared.module';

import { CommentdialogModule } from '../commentdialog/commentdialog.module';
@NgModule({
  declarations: [MonthlyinterestComponent],
  imports: [
    CommonModule, IgxsharedModule, MonthlyinterestRoutingModule,
    FormsModule,ReactiveFormsModule,CommentdialogModule
  ],
  
})
export class MonthlyinterestModule { }
