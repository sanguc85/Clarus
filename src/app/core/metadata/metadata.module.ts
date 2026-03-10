import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MetadataRoutingModule } from './metadata-routing.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IgxsharedModule } from 'src/app/shared/igxshared/igxshared.module';
import { MetadataComponent } from './metadata.component';
import { MetadataMetadataComponent } from './tabs/metadata-metadata/metadata-metadata.component';
import { UseraccessMetadataComponent } from './tabs/useraccess-metadata/useraccess-metadata.component';
import { RulesMetadataComponent } from './tabs/rules-metadata/rules-metadata.component';
import { ReferencedataMetadataModule } from './tabs/referencedata-metadatagrid/referencedata-metadata.module';
import { MetadataService } from './metadata.service';


@NgModule({
  declarations: [
    MetadataComponent, MetadataMetadataComponent, UseraccessMetadataComponent, RulesMetadataComponent
    
  ],
  imports: [
    CommonModule, MetadataRoutingModule, IgxsharedModule, FormsModule, ReactiveFormsModule, ReferencedataMetadataModule],
  providers: [MetadataService]
})
export class MetadataModule { }