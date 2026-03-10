import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EntitydetailsComponent } from './entitydetails.component';
import { EntitydetailsRoutingModule } from './entitydetails-routing.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IgxDialogModule, IgxSelectModule } from 'igniteui-angular';
import { IgxsharedModule } from 'src/app/shared/igxshared/igxshared.module';
import { SharedComponentsModule } from 'src/app/shared/shared-components/shared-components.module';



@NgModule({
  declarations: [EntitydetailsComponent],
  imports: [
    CommonModule,
    EntitydetailsRoutingModule,
    FormsModule,
    IgxSelectModule,
    IgxDialogModule,
    ReactiveFormsModule,
    IgxsharedModule,
    SharedComponentsModule
  ],
})
export class EntitydetailsModule {}
