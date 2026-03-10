import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ContactsComponent } from 'src/app/core/contacts/contacts.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IgxDialogModule, IgxSelectModule, IgxInputGroupModule, IgxIconModule, IgxButtonModule } from 'igniteui-angular';
import { IgxsharedModule } from '../igxshared/igxshared.module';
import { DeliveryinstructionsComponent } from 'src/app/core/deliveryinstructions/deliveryinstructions.component';
import { EmailDialogComponent } from '../components/email-dialog/email-dialog.component';




@NgModule({
  declarations: [ContactsComponent, DeliveryinstructionsComponent, EmailDialogComponent],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IgxDialogModule,
    IgxSelectModule,
    IgxInputGroupModule,
    IgxIconModule,
    IgxButtonModule,
    IgxsharedModule,
  ],
  exports: [ContactsComponent, DeliveryinstructionsComponent, EmailDialogComponent]
})
export class SharedComponentsModule { }
