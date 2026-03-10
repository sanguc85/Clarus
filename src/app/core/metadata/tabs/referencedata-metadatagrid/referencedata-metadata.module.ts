import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReferencedataMetadataRoutingModule } from './referencedata-metadata-routing.module';
import { BenchmarkdataComponent } from './subtabs/benchmarkdata/benchmarkdata.component';
import { HaircutComponent } from './subtabs/haircut/haircut.component';
import { RatingsComponent } from './subtabs/ratings/ratings.component';
import { SecuritymasterComponent } from './subtabs/securitymaster/securitymaster.component';
import { SecuritypricesComponent } from './subtabs/securityprices/securityprices.component';
import { ValuationdataComponent } from './subtabs/valuationdata/valuationdata.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IgxsharedModule } from 'src/app/shared/igxshared/igxshared.module';
import { ReferencedataMetadatagridComponent } from './referencedata-metadatagrid.component';
import { IgxDialogModule, IgxSelectModule } from '@infragistics/igniteui-angular';
import { SharedpipesModule } from "../../../../shared/sharedpipes/sharedpipes.module";



@NgModule({
    declarations: [ReferencedataMetadatagridComponent, HaircutComponent, SecuritypricesComponent, SecuritymasterComponent,
        BenchmarkdataComponent, ValuationdataComponent, RatingsComponent],
    imports: [
        CommonModule, IgxsharedModule, FormsModule, IgxSelectModule, ReactiveFormsModule, IgxDialogModule, ReferencedataMetadataRoutingModule,
        SharedpipesModule
    ]
})
export class ReferencedataMetadataModule { }
