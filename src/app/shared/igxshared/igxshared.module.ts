import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatTableModule } from '@angular/material/table';
import { MatToolbarModule } from '@angular/material/toolbar';
import {
  IgxGridModule,
  IgxTreeGridModule,
  IgxDialogModule,
  IgxActionStripModule,
  IgxIconModule,
  IgxNavigationDrawerModule,
  IgxRippleModule,
  IgxToggleModule,
  IgxCardModule,
  IgxToastModule,
  IgxButtonModule,
  IgxDatePickerModule, 
  IgxSimpleComboModule
} from '@infragistics/igniteui-angular';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

@NgModule({
  declarations: [],
  exports: [
    MatNativeDateModule,
    MatDatepickerModule,
    MatToolbarModule,
    MatButtonModule,
    MatDialogModule,
    MatInputModule,
    MatIconModule,
    IgxGridModule,
    MatTableModule,
    MatSelectModule,
    IgxTreeGridModule,
    IgxDialogModule,
    MatProgressSpinnerModule,
    IgxActionStripModule,
    IgxButtonModule,
    IgxIconModule,
    IgxNavigationDrawerModule,
    IgxRippleModule,
    IgxToggleModule,
    IgxCardModule,
    IgxDatePickerModule,
    IgxSimpleComboModule
  ],
  imports: [
    CommonModule,
    MatNativeDateModule,
    MatDatepickerModule,
    MatToolbarModule,
    MatButtonModule,
    MatDialogModule,
    MatInputModule,
    MatIconModule,
    IgxGridModule,
    MatTableModule,
    MatSelectModule,
    IgxTreeGridModule,
    IgxDialogModule,
    MatProgressSpinnerModule,
    IgxActionStripModule,
    IgxButtonModule,
    IgxIconModule,
    IgxNavigationDrawerModule,
    IgxRippleModule,
    IgxToggleModule,
    IgxCardModule,
    IgxToastModule,
    FormsModule,
    ReactiveFormsModule,
    IgxSimpleComboModule,
  ],
})
export class IgxsharedModule {}
