import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { MetadataComponent } from './metadata.component';
import { MetadataMetadataComponent } from './tabs/metadata-metadata/metadata-metadata.component';
import { RulesMetadataComponent } from './tabs/rules-metadata/rules-metadata.component';
import { UseraccessMetadataComponent } from './tabs/useraccess-metadata/useraccess-metadata.component';

const routes: Routes = [
  {
    path: '',
    component: MetadataComponent,
    children: [
      {
        path: '',
        redirectTo: 'ReferenceData',
        pathMatch: 'full',
        title: "''Clarus > MetaData > ReferenceData''",
      },
      {
        path: 'ReferenceData',
        loadChildren: () =>
          import(
            './tabs/referencedata-metadatagrid/referencedata-metadata.module'
          ).then((m) => m.ReferencedataMetadataModule),
        data: { title: 'Clarus > MetaData > ReferenceData' },
      },
      {
        path: 'Metadata',
        component: MetadataMetadataComponent,
        data: { title: 'Clarus > MetaData > Metadata' },
      },
      {
        path: 'Useraccess',
        component: UseraccessMetadataComponent,
        data: { title: 'Clarus > MetaData > UserAccess' }
      },
      {
        path: 'Rules',
        component: RulesMetadataComponent,
        data: { title: 'Clarus > MetaData > Rules' }
      }
    ]
  },
];

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    RouterModule.forChild(routes)
  ],
  exports: [
    RouterModule
  ]
})
export class MetadataRoutingModule { }
