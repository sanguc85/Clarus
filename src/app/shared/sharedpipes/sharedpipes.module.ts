import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormatNumberPipe } from '../filter.pipe';



@NgModule({
  declarations: [FormatNumberPipe],
  imports: [
    CommonModule
  ],
  exports: [FormatNumberPipe],
  providers: [FormatNumberPipe]
})
export class SharedpipesModule { }
