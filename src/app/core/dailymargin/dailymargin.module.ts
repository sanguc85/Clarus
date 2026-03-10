import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { IgxsharedModule } from 'src/app/shared/igxshared/igxshared.module';
import { DailymarginComponent } from './dailymargin.component';
import { DailymarginRoutingModule } from './dailymargin-routing.module';
import { MatPaginatorModule } from '@angular/material/paginator';
import { FilterPipe, SpaceSeparatedPipe, formatNumberTo2dp } from 'src/app/shared/filter.pipe';
import { CommentdialogModule } from '../commentdialog/commentdialog.module';
import { SharedpipesModule } from 'src/app/shared/sharedpipes/sharedpipes.module';
import { CommaSeparatedDirective } from 'src/app/shared/comma-separated.directive';
import { IgxSplitterModule } from 'igniteui-angular';

@NgModule({
  declarations: [
    DailymarginComponent,
    FilterPipe,
    SpaceSeparatedPipe,
    formatNumberTo2dp,
    CommaSeparatedDirective
  ],
  imports: [
    CommonModule,
    IgxsharedModule,
    DailymarginRoutingModule,
    MatPaginatorModule,
    FormsModule,
    ReactiveFormsModule,
    CommentdialogModule,
    SharedpipesModule,
    IgxSplitterModule,
  ]
})
export class DailymarginModule { }
