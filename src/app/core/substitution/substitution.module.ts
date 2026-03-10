import { NgModule } from '@angular/core';
import { FormsModule,ReactiveFormsModule  } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { SubstitutionComponent } from './substitution.component';
import { SubstitutionRoutingModule } from './substitution-routing.module';
import { IgxsharedModule } from 'src/app/shared/igxshared/igxshared.module';
import { FilterSubPipe } from 'src/app/shared/filter-sub.pipe';


@NgModule({
  declarations: [SubstitutionComponent,FilterSubPipe],
  imports: [
    CommonModule, IgxsharedModule, SubstitutionRoutingModule,
    FormsModule,ReactiveFormsModule
  ]
})
export class SubstitutionModule { }
