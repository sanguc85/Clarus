import { NgModule } from '@angular/core';
import { FormsModule,ReactiveFormsModule  } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { IgxsharedModule } from 'src/app/shared/igxshared/igxshared.module';
import { CommentdialogComponent } from './commentdialog.component';


@NgModule({
  declarations: [CommentdialogComponent],
  imports: [
    CommonModule,
    IgxsharedModule,
    FormsModule,
    ReactiveFormsModule
  ],
  exports: [CommentdialogComponent],
})
export class CommentdialogModule { }
