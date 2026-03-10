import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { BenchmarkdataComponent } from './subtabs/benchmarkdata/benchmarkdata.component';
import { HaircutComponent } from './subtabs/haircut/haircut.component';
import { RatingsComponent } from './subtabs/ratings/ratings.component';
import { SecuritymasterComponent } from './subtabs/securitymaster/securitymaster.component';
import { SecuritypricesComponent } from './subtabs/securityprices/securityprices.component';
import { ValuationdataComponent } from './subtabs/valuationdata/valuationdata.component';
import { ReferencedataMetadatagridComponent } from './referencedata-metadatagrid.component';


const routes: Routes = [
  {
    path: '',
    redirectTo: 'Haircut',
    pathMatch: 'full',
    title: 'Clarus > MetaData > ReferenceData > Haircut',
  },
  {
    path: '',
    component: ReferencedataMetadatagridComponent,
    children: [
      { path: '', component: HaircutComponent, pathMatch: 'full' },
      { path: 'Haircut', component: HaircutComponent, data: { title: 'Clarus > MetaData > ReferenceData > Haircut' } },
      { path: 'SecurityPrices', component: SecuritypricesComponent, data: { title: 'Clarus > MetaData > ReferenceData > SecurityPrices' } },
      { path: 'SecurityMaster', component: SecuritymasterComponent, data: { title: 'Clarus > MetaData > ReferenceData > SecurityMaster' } },
      { path: 'BenchmarkData', component: BenchmarkdataComponent, data: { title: 'Clarus > MetaData > ReferenceData > BenchmarkData' } },
      { path: 'ValuationData', component: ValuationdataComponent, data: { title: 'Clarus > MetaData > ReferenceData > ValuationData' } },
      { path: 'Ratings', component: RatingsComponent, data: { title: 'Clarus > MetaData > ReferenceData > Ratings' } },
    ]
  },
];


@NgModule({
  declarations: [],
  imports: [
    CommonModule, RouterModule.forChild(routes)
  ],
  exports: [RouterModule]
})
export class ReferencedataMetadataRoutingModule { }
