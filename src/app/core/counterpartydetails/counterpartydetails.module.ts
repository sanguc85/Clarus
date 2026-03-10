import { NgModule } from '@angular/core';
import { FormsModule,ReactiveFormsModule  } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { CounterpartydetailsComponent } from './counterpartydetails.component';
import { CounterpartydetailsRoutingModule } from './counterpartydetails-routing.module';
import { IgxsharedModule } from 'src/app/shared/igxshared/igxshared.module';
import { DecimalPipe,PercentPipe } from '@angular/common'; // Import DecimalPipe
import { FormatDateStringPipe } from 'src/app/shared/filter.pipe';
import {FormatDateStringDirective } from 'src/app/shared/format-percentage.directive';
import { SharedComponentsModule } from 'src/app/shared/shared-components/shared-components.module';

@NgModule({
  declarations: [CounterpartydetailsComponent,FormatDateStringPipe,FormatDateStringDirective],
  providers: [DecimalPipe,PercentPipe],
  imports: [
    CommonModule, IgxsharedModule, CounterpartydetailsRoutingModule,
    FormsModule,ReactiveFormsModule,
    SharedComponentsModule
  ]
})
export class CounterpartydetailsModule { }
