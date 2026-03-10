import { NgModule } from '@angular/core';
import { FormsModule,ReactiveFormsModule  } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { IgxsharedModule } from 'src/app/shared/igxshared/igxshared.module';
import { SharedComponentsModule } from 'src/app/shared/shared-components/shared-components.module';
import { CollateralmovementComponent } from './collateralmovement.component';
import { CollateralmovementRoutingModule } from './collateralmovement-routing.module'; 
import { MatPaginatorModule } from '@angular/material/paginator'; 

@NgModule({
  declarations: [
    CollateralmovementComponent
  ],
  imports: [
    CommonModule,
    IgxsharedModule,
    SharedComponentsModule,
    CollateralmovementRoutingModule,
    MatPaginatorModule,
    FormsModule,
    ReactiveFormsModule
  ]
})
export class CollateralmovementModule { }
