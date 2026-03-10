import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { HaircutService } from './haircut.service';
import { DefaultSortingStrategy, IgxExcelExporterOptions, IgxExcelExporterService, IgxGridComponent, SortingDirection } from 'igniteui-angular';
import { CustomErrorHandler } from 'src/app/shared/services/error-handler.service';
import { SpinnerService } from 'src/app/shared/services/spinner.service';
import { ToasterService } from 'src/app/shared/services/toaster.service';
import { MetadataService } from 'src/app/core/metadata/metadata.service';

@Component({
  selector: 'app-haircut',
  templateUrl: './haircut.component.html',
  styleUrls: ['./haircut.component.scss'],
})
export class HaircutComponent implements OnInit {
  @Input() auditData: any;
  contentTab: string = 'CSA';
  haircutData: any[] = [];
  @ViewChild('Haircut') hairCutData!: IgxGridComponent;

  public groupingExpressions = [
    {
      dir: SortingDirection.Asc,
      fieldName: 'Entity',
      ignoreCase: false,
      strategy: DefaultSortingStrategy.instance(),
    },
    {
      dir: SortingDirection.Asc,
      fieldName: 'Counterparty',
      ignoreCase: false,
      strategy: DefaultSortingStrategy.instance(),
      parent: {
        dir: SortingDirection.Asc, // Sorting direction for the parent grouping (Entity)
        fieldName: 'Entity', // Field name for the parent grouping (Entity)
        ignoreCase: false,
        strategy: DefaultSortingStrategy.instance(),
      },
    },
  ];
  constructor(
    private haircutService: HaircutService,
    private excelExportService: IgxExcelExporterService,
    private spinner: SpinnerService,
    readonly errorHandler: CustomErrorHandler,
    readonly toasterService: ToasterService,
    public metaDataService: MetadataService
  ) {}

  ngOnInit(): void {
    this.loadHaircutData(this.contentTab);
  }

  onTabChange(tabName: string) {
    this.contentTab = tabName;
    this.loadHaircutData(tabName);
  }

  loadHaircutData(tabName: string) {
    this.errorHandler.clearErrorList();
    this.spinner.show();
    this.haircutService.getHaircutData(tabName).subscribe({
      next: (data) => {
        this.spinner.hide();
        // Sort the data based on Collateral Type, Entity, and Counterparty
        data.sort((a, b) => {
          if (a.Entity !== b.Entity) {
            return a.Entity.localeCompare(b.Entity);
          } else if (a.Counterparty !== b.Counterparty) {
            return a.Counterparty.localeCompare(b.Counterparty);
          } else {
            return a.CollateralType.localeCompare(b.CollateralType);
          }
        });
        this.haircutData = data;
      },
      error: (err) => {
        this.haircutData = [];
        this.spinner.hide();
      },
    });
  }

  exportToExcel(): void {
    this.spinner.show();
    const date = new Date().toISOString().replace(/T/gi, '_').split('.')[0];
    const pathName = `Haircut_${this.contentTab}_`;
    try {
        this.excelExportService.export(
          this.hairCutData,
          new IgxExcelExporterOptions(
            (pathName + date).replace(/\-|:|\s/gi, '')
          )
        );
      // Introduce a delay before hiding the spinner (e.g., 500 milliseconds)
      setTimeout(() => {
        this.spinner.hide();
      }, 500);
      this.toasterService.toast('File exported successfully.');
    } catch (error) {
      this.spinner.hide();
      console.error('An error occurred during export:', error);
    }
  }
}
