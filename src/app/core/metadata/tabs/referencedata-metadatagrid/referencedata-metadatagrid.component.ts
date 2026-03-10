import { Component, OnInit } from '@angular/core';
import { MetadataService } from '../../metadata.service';

@Component({
  selector: 'app-referencedata-metadatagrid',
  templateUrl: './referencedata-metadatagrid.component.html',
  styleUrls: ['./referencedata-metadatagrid.component.scss'],
})
export class ReferencedataMetadatagridComponent implements OnInit {
  contentTab: string = 'Haircut';
  constructor(public metaDataService: MetadataService) {}

  ngOnInit(): void {}

  onTabChange(tabName: string): void {
    this.contentTab = tabName;
  }
}
